import { useMemo } from "react";
import { useTopicHook } from "../hooks/useTopicHook";
import { useTopicState } from "../utils/useTopicState";
import { toast } from "react-toastify";
import Fuse from "fuse.js";

export function Filters() {

    const { currentTopic, searchQuery, allTopicMessages, loadedAndTotalMessages  } = useTopicHook();

    const partitions = useMemo(() => {
        if (!currentTopic) return [];
        return currentTopic.offsets.map((offset) => ({
            value: offset.partition,
            label: `Partition ${offset.partition} | ${offset.total} messages`
        }));
    }, [currentTopic]);

    const selectedPartition = useMemo(() => {
        if (!currentTopic) return 0;
        return currentTopic.selectedPartition;
    }, [currentTopic]);

    const setSelectedPartition = (partition: number) => {
        if (!currentTopic) return;
        const prev = selectedPartition
        useTopicState.setState((state) => ({
            topics: {
                ...state.topics,
                [currentTopic.name]: {
                    ...state.topics[currentTopic.name],
                    selectedPartition: partition,
                    messages: [] // reset the messages
                }
            }
        }));
        toast.success(`Pertition changed from ${prev} to ${partition}`)
    };

    const updateSearchQuery = (query: string) => {
        if (!currentTopic) return;
        useTopicState.setState((state) => ({
            topics: {
                ...state.topics,
                [currentTopic.name]: {
                    ...state.topics[currentTopic.name],
                    searchQuery: query
                }
            }
        }));
    }

    const configureFuse = () => {
        if (!currentTopic) return;
        useTopicState.setState((state) => ({
            topics: {
                ...state.topics,
                [currentTopic.name]: {
                    ...state.topics[currentTopic.name],
                     fuse: new Fuse(allTopicMessages, {
                        keys: ['message', 'offset', 'timestamp'], // or deeper keys like 'data.status'
                        threshold: 0.3, // fuzziness
                        ignoreLocation: true,
                        minMatchCharLength: 1, // Match even 1-character terms

                        // Tokenize by space so multiple words are matched separately
                        // useExtendedSearch: true, // Enables AND / OR search syntax
                        findAllMatches: true,
                    }),
                }
            }
        }));
    }


    if (!currentTopic) return null;


    return (
        <div className="filters-section">
            <div className="filters-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="filter-group">
                    <label className="filter-label">Partition</label>
                    <select disabled={ !currentTopic?.isLoaded || currentTopic?.isLoading } className="filter-input" style={{ width: '450px' }} value={selectedPartition} onChange={(e) => setSelectedPartition( Number(e.target.value) )}>
                        <option value={-1} disabled>Select Partition</option>
                        { partitions.map((partition) => (
                            <option key={partition.value} value={partition.value}>
                                {partition.label}
                            </option>
                        )) }
                    </select>
                </div>

                <div className="filter-group">
                    { currentTopic.isLoading ? (<>
                        <span className="loading-text">Loading...</span>
                    </>) : null}
                </div>

                <div className="filter-group">
                    <label className="filter-label">
                        Search (<small>works only on alrady loaded data</small>){" "}
                        {`${loadedAndTotalMessages.loaded}/${loadedAndTotalMessages.total ?? "?"}`}
                    </label>
                    <input disabled={!currentTopic?.isLoaded || currentTopic?.isLoading} onFocus={configureFuse}
                        type="text"
                        className="filter-input"
                        style={{ width: '450px' }}
                        placeholder="Search by key or value…"
                        value={searchQuery}
                        onChange={(e) => updateSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};