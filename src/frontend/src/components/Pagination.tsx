import { useState } from "react";
import { useTopicHook } from "../hooks/useTopicHook";
import { useTopicState } from "../utils/useTopicState";
import { toast } from "react-toastify";

type PaginationProps = {
    currentPage: number;
    totalLoadedPages: number;
    totalServerPages: number;
    isSearching: boolean;
    onPageChange: (page: number) => void;
    loading: boolean
};

export function Pagination({ currentPage, totalLoadedPages, totalServerPages, isSearching, onPageChange, loading }: PaginationProps) {
    const { filteredMessages, currentTopic, messagesPerPage } = useTopicHook();
    const [perPage, setPerPage] = useState(String(messagesPerPage))

    if ((totalLoadedPages <= 1 && totalServerPages <= 1) || loading) return null;

    if (filteredMessages.length === 0) return null;


    const totalPages = isSearching ? totalLoadedPages : totalServerPages;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <div>
                <div style={{ display: "flex" }}>
                    <span className="pagination-info" style={{ marginRight: 10, marginTop: 5 }}>Per Page: </span>
                    <input className="form-control-limit" value={perPage} onChange={(e) => {
                        const value = e.target.value
                        setPerPage(value)
                    }} disabled={!currentTopic?.isLoaded || currentTopic?.isLoading} />
                    <button disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}
                        className={`pagination-btn active`} style={{ marginLeft: 10 }}
                        onClick={() => {
                            if (!isNaN(Number(perPage)) && Number(perPage) >= 1) {
                                useTopicState.setState(() => ({
                                    messagesPerPage: Number(perPage)
                                }))
                                toast.success("Per page count updated")
                                onPageChange(1)
                            } else {
                                toast.error('unable to update per page count')
                            }
                        }}
                    >
                        set
                    </button>
                </div>
            </div>

            <div>
                {/* <button
                    className="pagination-btn" style={{marginRight: 1}}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || !currentTopic?.isLoaded || currentTopic?.isLoading}
                >
                    <i className="fas fa-chevron-left"></i> Previous { currentPage === 1 ? '' : `(${currentPage - 1})`}
                </button> */}

                {/* disabled page number because loading page in the center creates issue if previous is not loaded yet */}

                {pages.map(page => (
                    <button disabled={!currentTopic?.isLoaded || currentTopic?.isLoading} style={{ margin: 2}}
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button style={{marginLeft: 1}}
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || !currentTopic?.isLoaded || currentTopic?.isLoading}
                >
                    <i className="fas fa-chevron-right"></i> Load next page { currentPage === totalPages ? '' : `(${currentPage + 1})`}
                </button>

                <span className="pagination-info" style={{ marginLeft: 10 }}>
                    Page {currentPage} of {totalPages}
                </span>
            </div>
        </div>
    );
};