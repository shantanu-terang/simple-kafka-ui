import { toast } from "react-toastify";
import { produceMessage } from "../utils/functions";
import type { MessageType } from "../utils/useTopicState";
import { MessageRow } from "./MessageRow";
import { useTopicHook } from "../hooks/useTopicHook";

type MessagesTableProps = {
    messages: MessageType[];
    expandedRows: Set<number>;
    onToggleExpand: (offset: number) => void;
    loading?: boolean;
    onOpenProduceModal: () => void
    onLoadMessages: () => void
};

export function MessagesTable({ messages, expandedRows, onToggleExpand, loading, onOpenProduceModal, onLoadMessages }: MessagesTableProps) {
    const { currentTopic,/* allTopicMessages */ } = useTopicHook()
    if (loading /*|| (allTopicMessages.length === 0 && currentTopic?.isLoading)*/) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                Loading messages...
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            // <div className="loading">
            //     <i className="fas fa-inbox"></i>
            //     <span style={{ marginLeft: '8px' }}>No messages found</span>
            // </div>

            <div className="empty-state" >
                <div className="empty-content" style={{ width: '530px' }}>
                    <i className="fas fa-inbox"></i>
                    {/* <h2>No messages</h2> */}
                    <p>No messages loaded / available.</p>
                    {/* <ul style={{ listStyle: "none" }}>
                        <li>Check if the selected partition has messages.</li>
                        <li>If trying to search/filter try changing the the search string.</li>
                        <li>Else you can try producing a message or load messages.</li>
                    </ul> */}
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <button className="btn btn--primary btn--sm" style={{ height: 50 }} onClick={onOpenProduceModal}
                            disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}
                        >
                            <i className="fas fa-plus-circle" style={{ marginRight: 10, marginTop: 20, fontSize: 30 }}></i> Produce Message
                        </button>

                        <button className="btn btn--primary btn--sm" style={{ height: 50 }} onClick={onLoadMessages}
                            disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}
                        >
                            <i className="fas fa-sync-alt" style={{ marginRight: 10, marginTop: 20, fontSize: 30 }}></i> Load Messages
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-container">
            <table className="messages-table">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}></th>
                        <th style={{ width: '100px' }}>Offset</th>
                        <th style={{ width: '200px' }}>Timestamp</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map((message, index) => (
                        <MessageRow
                            key={`${message.offset}-${index}`}
                            message={message}
                            isExpanded={expandedRows.has(message.offset as number)}
                            onToggleExpand={() => onToggleExpand(message.offset as number)}
                            onResend={async () => {
                                toast.promise(
                                    produceMessage(message.topic, message.partition, message.message),
                                    {
                                        pending: 'Resending message...',
                                        success: 'Message resent successfully',
                                        error: 'Failed to resend message'
                                    }
                                );
                            }}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};