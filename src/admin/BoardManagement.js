import React, { useState, useMemo } from 'react';
import { boards as initialBoards, posts as initialPosts } from '../utils/dummyData';
import './BoardManagement.css';

const BoardManagement = () => {
    const [boards, setBoards] = useState(initialBoards);
    const [posts, setPosts] = useState(initialPosts);
    const [newBoard, setNewBoard] = useState({ id: '', name: '', description: '' });
    const [selectedBoard, setSelectedBoard] = useState(initialBoards[0]?.id || '');

    const handleNewBoardChange = (e) => {
        const { name, value } = e.target;
        setNewBoard(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateBoard = (e) => {
        e.preventDefault();
        if (!newBoard.id || !newBoard.name) {
            alert('게시판 ID와 이름은 필수입니다.');
            return;
        }
        if (boards.some(b => b.id === newBoard.id)) {
            alert('이미 존재하는 게시판 ID입니다.');
            return;
        }
        const newBoardData = { ...newBoard };
        setBoards([...boards, newBoardData]);
        setNewBoard({ id: '', name: '', description: '' }); // Reset form
    };

    const handleDeleteBoard = (boardId) => {
        if (window.confirm('정말로 이 게시판을 삭제하시겠습니까? 해당 게시판의 모든 글이 삭제됩니다.')) {
            setBoards(boards.filter(b => b.id !== boardId));
            setPosts(posts.filter(p => p.boardId !== boardId));
        }
    };

    const handleDeletePost = (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            setPosts(posts.filter(p => p.id !== postId));
        }
    };

    const filteredPosts = useMemo(() => {
        return posts.filter(p => p.boardId === selectedBoard);
    }, [posts, selectedBoard]);

    return (
        <div className="board-management">
            <h1>게시판 관리</h1>

            {/* Section for Managing Boards */}
            <div className="management-section">
                <h2>게시판 목록 및 생성</h2>
                <div className="board-list-container">
                    <div className="current-boards">
                        <h3>현재 게시판</h3>
                        <ul className="board-list">
                            {boards.map(board => (
                                <li key={board.id} className="board-list-item">
                                    <div className="board-info">
                                        <p className="board-name">{board.name}</p>
                                        <p className="board-id">ID: {board.id}</p>
                                    </div>
                                    <button onClick={() => handleDeleteBoard(board.id)} className="delete-btn">삭제</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="create-board-form">
                        <h3>새 게시판 생성</h3>
                        <form onSubmit={handleCreateBoard}>
                            <div className="form-group">
                                <label htmlFor="new-board-id">게시판 ID</label>
                                <input type="text" id="new-board-id" name="id" value={newBoard.id} onChange={handleNewBoardChange} placeholder="e.g., notice" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-board-name">게시판 이름</label>
                                <input type="text" id="new-board-name" name="name" value={newBoard.name} onChange={handleNewBoardChange} placeholder="e.g., 공지사항" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-board-desc">설명</label>
                                <input type="text" id="new-board-desc" name="description" value={newBoard.description} onChange={handleNewBoardChange} placeholder="e.g., 중요 공지를 확인하세요." />
                            </div>
                            <button type="submit" className="create-btn">생성</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Section for Managing Posts */}
            <div className="management-section">
                <h2>게시글 관리</h2>
                <div className="post-controls">
                    <label htmlFor="board-select">게시판 선택:</label>
                    <select id="board-select" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
                        {boards.map(board => (
                            <option key={board.id} value={board.id}>{board.name}</option>
                        ))}
                    </select>
                </div>
                <div className="post-table-container">
                    <table className="post-table">
                        <thead>
                            <tr>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>작성일</th>
                                <th>조회수</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.length > 0 ? filteredPosts.map(post => (
                                <tr key={post.id}>
                                    <td>{post.title}</td>
                                    <td>{post.author}</td>
                                    <td>{post.createdAt}</td>
                                    <td>{post.views}</td>
                                    <td>
                                        <button onClick={() => handleDeletePost(post.id)} className="delete-btn">삭제</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5">이 게시판에는 아직 글이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BoardManagement;
