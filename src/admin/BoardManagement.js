import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './contexts/AdminContext';
import './BoardManagement.css';

// --- 컴포넌트: 상세 보기 모달 ---
const PostDetailModal = ({ post, onClose }) => {
    if (!post) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{post.title}</h2>
                <div className="post-meta">
                    <span>작성자: {post.authorNickname} ({post.authorId})</span>
                    <span>작성일: {new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br />') : '' }} />
            </div>
        </div>
    );
};

// --- 글 작성 모달 ---
const CreatePostModal = ({ category, onClose, onPostCreated }) => {
    const { createPost, addNotification } = useAdmin();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            addNotification('제목과 내용을 모두 입력해주세요.', 'warn');
            return;
        }
        setIsSubmitting(true);
        try {
            await createPost({ categoryId: category.id, title, content });
            addNotification('게시글이 성공적으로 등록되었습니다.', 'success');
            onPostCreated();
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{category.name}: 새 글 작성</h2>
                <form onSubmit={handleSubmit} className="post-create-form">
                    <input type="text" placeholder="제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} required />
                    <textarea placeholder="내용을 입력하세요" value={content} onChange={e => setContent(e.target.value)} required />
                    <button type="submit" className="create-btn" disabled={isSubmitting}>
                        {isSubmitting ? '등록 중...' : '등록하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- 카테고리 수정 모달 ---
const EditCategoryModal = ({ category, onClose, onUpdated }) => {
    const { updateBoardCategory } = useAdmin();
    const [name, setName] = useState(category.name);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateBoardCategory(category.id, { name });
            onUpdated();
            onClose();
        } catch (err) {}
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>게시판 수정</h2>
                <form onSubmit={handleSubmit}>
                    <input value={name} onChange={e => setName(e.target.value)} />
                    <button type="submit" className="create-btn">수정하기</button>
                </form>
            </div>
        </div>
    );
};

// --- 글 수정 모달 ---
const EditPostModal = ({ post, onClose, onUpdated }) => {
    const { updatePost } = useAdmin();
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updatePost(post.id, { title, content, categoryId: post.categoryId });
            onUpdated();
            onClose();
        } catch (err) {}
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>글 수정</h2>
                <form onSubmit={handleSubmit} className="post-create-form">
                    <input value={title} onChange={e => setTitle(e.target.value)} />
                    <textarea value={content} onChange={e => setContent(e.target.value)} />
                    <button type="submit" className="create-btn">수정하기</button>
                </form>
            </div>
        </div>
    );
};

// --- 메인 컴포넌트 ---
const BoardManagement = () => {
    const { 
        getAllBoardCategories, createBoardCategory, deleteBoardCategory,
        getPostsByCategory, deletePost, getPostById, addNotification 
    } = useAdmin();

    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState({ categories: true, posts: false });
    const [viewingPost, setViewingPost] = useState(null);
    const [isCreatingPost, setIsCreatingPost] = useState(false);

    // 새로 추가된 state
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingPost, setEditingPost] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(prev => ({ ...prev, categories: true }));
            const data = await getAllBoardCategories();
            setCategories(data);
        } catch (error) {
            addNotification('게시판 목록 로딩 실패', 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, categories: false }));
        }
    }, [getAllBoardCategories, addNotification]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSelectCategory = useCallback(async (category) => {
        setViewingPost(null);

        if (selectedCategory?.id === category.id) {
            setSelectedCategory(null);
            setPosts([]);
            return;
        }
        setSelectedCategory(category);
        try {
            setIsLoading(prev => ({ ...prev, posts: true }));
            const postData = await getPostsByCategory(category.id);
            setPosts(postData);
        } catch (error) {
            addNotification(`${category.name} 게시글 로딩 실패`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, posts: false }));
        }
    }, [selectedCategory, getPostsByCategory, addNotification]);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await createBoardCategory({ categoryName: newCategoryName });
            setNewCategoryName('');
            fetchCategories();
        } catch (error) {}
    };

    const handleDeleteCategory = async (e, categoryId) => {
        e.stopPropagation();
        if (window.confirm('정말 이 게시판을 삭제하시겠습니까?')) {
            try {
                await deleteBoardCategory(categoryId);
                if (selectedCategory?.id === categoryId) {
                    setSelectedCategory(null);
                    setPosts([]);
                }
                fetchCategories();
            } catch (error) {}
        }
    };
    
    const handleDeletePost = async (postId) => {
        if (window.confirm('이 게시글을 정말로 삭제하시겠습니까?')) {
            try {
                await deletePost(postId);
                if (selectedCategory) {
                    handleSelectCategory(selectedCategory); 
                }
            } catch (error) {}
        }
    };

    const handleViewPost = async (postId) => {
        try {
            const postData = await getPostById(postId);
            setViewingPost(postData);
        } catch (error) {
            addNotification('게시글을 불러오는 데 실패했습니다.', 'error');
        }
    };

    const handlePostCreated = () => {
        setIsCreatingPost(false);
        if (selectedCategory) {
            const currentCategory = { ...selectedCategory };
            setSelectedCategory(null);
            handleSelectCategory(currentCategory);
        }
    };

    return (
        <div className="board-management">
            <h1>게시판 및 게시글 통합 관리</h1>

            {/* --- 게시판 카테고리 관리 섹션 --- */}
            <div className="management-section">
                <div className="board-list-container">
                    <div className="current-boards">
                        <h2>게시판 목록 (클릭하여 게시글 보기)</h2>
                        {isLoading.categories ? <p>로딩 중...</p> : (
                            <ul className="board-list">
                                {categories.map(cat => (
                                    <li key={cat.id} 
                                        className={`board-list-item ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                        onClick={() => handleSelectCategory(cat)}>
                                        <div className="board-info">
                                            <p className="board-name">{cat.name}</p>
                                            <p className="board-id">ID: {cat.id}</p>
                                        </div>
                                        <div>
                                            <button onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); }} className="edit-btn">수정</button>
                                            <button onClick={(e) => handleDeleteCategory(e, cat.id)} className="delete-btn">삭제</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="create-board-form">
                        <h2>새 게시판 생성</h2>
                        <form onSubmit={handleCreateCategory}>
                            <div className="form-group">
                                <label htmlFor="categoryName">게시판 이름</label>
                                <input
                                    type="text"
                                    id="categoryName"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="예: 자유게시판"
                                    required
                                />
                            </div>
                            <button type="submit" className="create-btn">생성하기</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- 선택된 게시판의 게시글 관리 섹션 --- */}
            {selectedCategory && (
                <div className="management-section">
                    <div className="section-header">
                        <h2>"{selectedCategory.name}" 게시글 목록</h2>
                        <button className="create-btn" onClick={() => setIsCreatingPost(true)}>새 글 작성</button>
                    </div>
                    {isLoading.posts ? <p>게시글 로딩 중...</p> : (
                        <div className="post-table-container">
                            {posts.length > 0 ? (
                                <table className="post-table">
                                    <thead>
                                        <tr>
                                            <th>글 번호</th>
                                            <th>제목</th>
                                            <th>작성자 (ID)</th>
                                            <th>작성일</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map(post => (
                                            <tr key={post.id}>
                                                <td>{post.id}</td>
                                                <td className="post-title" onClick={() => handleViewPost(post.id)}>
                                                    {post.title}
                                                </td>
                                                <td>{post.authorNickname} ({post.authorId})</td>
                                                <td>{new Date(post.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <button onClick={() => setEditingPost(post)} className="edit-btn">수정</button>
                                                    <button onClick={() => handleDeletePost(post.id)} className="delete-btn">삭제</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p>이 게시판에는 게시글이 없습니다.</p>}
                        </div>
                    )}
                </div>
            )}

            {/* --- 모달 렌더링 영역 --- */}
            <PostDetailModal post={viewingPost} onClose={() => setViewingPost(null)} />
            {isCreatingPost && selectedCategory && (
                <CreatePostModal 
                    category={selectedCategory} 
                    onClose={() => setIsCreatingPost(false)} 
                    onPostCreated={handlePostCreated}
                />
            )}
            {editingCategory && (
                <EditCategoryModal 
                    category={editingCategory} 
                    onClose={() => setEditingCategory(null)} 
                    onUpdated={fetchCategories}
                />
            )}
            {editingPost && (
                <EditPostModal 
                    post={editingPost} 
                    onClose={() => setEditingPost(null)} 
                    onUpdated={() => handleSelectCategory(selectedCategory)}
                />
            )}
        </div>
    );
};

export default BoardManagement;
