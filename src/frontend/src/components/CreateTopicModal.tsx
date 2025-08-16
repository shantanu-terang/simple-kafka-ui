import { useState } from "react";
import { Modal } from "./Modal";
import { createTopic } from "../utils/functions";
import { toast } from "react-toastify";

type CreateTopicModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function CreateTopicModal({ isOpen, onClose }: CreateTopicModalProps) {
    const [topicName, setTopicName] = useState('');
    const [partitions, setPartitions] = useState('1');
    const [replicationFactor, setReplicationFactor] = useState('1');

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        toast.promise(
            createTopic(topicName, parseInt(partitions, 10), parseInt(replicationFactor, 10)),
            {
                pending: "Creating topic...",
                success: "Topic created successfully",
                error: "Unable to create topic"
            }
        )
        onClose();
        setTopicName('');
        setPartitions('1');
        setReplicationFactor('1');
        
        
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Topic">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Topic Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        placeholder="Enter topic name"
                        min={1}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Partitions</label>
                    <input
                        type="number"
                        className="form-control"
                        value={partitions}
                        onChange={(e) => setPartitions(e.target.value)}
                        min={1}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Replication Factor</label>
                    <input
                        type="number"
                        className="form-control"
                        value={replicationFactor}
                        onChange={(e) => setReplicationFactor(e.target.value)}
                        required
                    />
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={!topicName}>
                        Create Topic
                    </button>
                </div>
            </form>
        </Modal>
    );
};