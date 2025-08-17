import { useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal";
import { produceMessage } from "../utils/functions";
import { useTopicHook } from "../hooks/useTopicHook";
import { toast } from "react-toastify";

type ProduceMessageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedTopic: string | null;
};


export function ProduceMessageModal({ isOpen, onClose, selectedTopic }: ProduceMessageModalProps) {
    const [partition, setPartition] = useState('0');
    const [message, setMessage] = useState('');

    const { currentTopic } = useTopicHook();

    const partitions = useMemo(() => {
        if (!currentTopic) return [];
        return currentTopic.offsets.map((offset) => ({
            value: offset.partition,
            label: `Partition ${offset.partition} | ${offset.total} messages`
        }));
    }, [currentTopic]);

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        toast.promise(
            produceMessage(selectedTopic!, parseInt(partition, 10), message),
            {
                pending: 'Sending message...',
                success: "Message sent!",
                error: "Unable to send message."
            }
        )
        onClose();
        setMessage('');
        setPartition('0');

    };

    useEffect(() => {
        setPartition(currentTopic?.selectedPartition.toString() || '0');
    }, [currentTopic?.selectedPartition]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Produce New Message" customStyle={{ maxWidth: '700px' }}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Topic</label>
                    <input type="text" className="form-control" value={selectedTopic || ''} readOnly />
                </div>

                <div className="form-group">
                    <label className="form-label">Partition</label>
                    <select className="form-control" value={partition} onChange={(e) => setPartition(e.target.value)} required>
                        <option value="" disabled>Select Partition</option>
                        {partitions.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Message (JSON)</label>
                    <textarea
                        className="form-control"
                        rows={10}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={JSON.stringify({"event_type": "user.action", "source": "web-service", "data": {"user_id": "user123", "action": "create"}}, null, 4)}
                        required
                    ></textarea>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn--primary">Produce Message</button>
                </div>
            </form>
        </Modal>
    );
};