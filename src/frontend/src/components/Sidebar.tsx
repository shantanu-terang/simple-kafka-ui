import { useEffect, useMemo } from "react";
import { loadTopics } from "../utils/functions";
import { useTopicState } from "../utils/useTopicState";
import { toast } from "react-toastify";

type SidebarProps = {
    collapsed: boolean;
    tabs: { topic: string }[];
    activeTabIndex: number;
    onTopicOpen: (topic: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    toggleSidebar: () => void;
};

export function Sidebar({ collapsed, tabs, activeTabIndex, onTopicOpen, searchTerm, setSearchTerm, toggleSidebar }: SidebarProps) {
    const topics = useTopicState(state => state.allTopics);

    const filteredTopics = useMemo(() => {
        return topics.filter(topic =>
            topic.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, topics]);

    const isTopicOpen = (topic: string) => {
        return tabs.some(tab => tab.topic === topic);
    };

    const isTopicActive = (topic: string) => {
        return activeTabIndex >= 0 && tabs[activeTabIndex]?.topic === topic;
    };

    useEffect(() => {
        loadTopics()
    }, []);

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <h3 className="sidebar-title">Topics</h3>}
                <button className="collapse-btn" onClick={toggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                </button>
            </div>

            {!collapsed && (
                <div className="search-box">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button className="btn btn--secondary btn--sm" style={{ marginLeft: 5, }} onClick={() => {
                        toast.promise(loadTopics, {
                            pending: 'Reloading topics...',
                            success: 'Topics reloaded successfully',
                            error: 'Failed to reload topics'
                        });
                    }} title="Reload topics">
                        <i className="fas fa-refresh"></i>
                    </button>
                </div>
            )}

            <div className="topic-list">
                {filteredTopics.map((topic) => (
                    <button
                        key={topic}
                        className={`topic-item ${isTopicActive(topic) ? 'active' : ''} ${isTopicOpen(topic) ? 'opened' : ''}`}
                        onClick={() => onTopicOpen(topic)}
                        title={collapsed ? topic : ''}
                    >
                        <span>
                            <i className="fas fa-list"></i>
                            {!collapsed && <span className="topic-name">{topic}</span>}
                        </span>
                        {!collapsed && isTopicOpen(topic) && (
                            <span className="topic-status">
                                <i className="fas fa-circle"></i>
                            </span>
                        )}
                    </button>
                ))}
                {filteredTopics.length === 0 && (
                    <div style={{ padding: '10px', color: '#999', textAlign: 'center' }}>
                        {collapsed ? 'No topics' : 'No topics found'}
                    </div>
                )}
            </div>
        </div>
    );
};