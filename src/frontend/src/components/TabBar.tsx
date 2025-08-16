import { useMemo } from "react";
import { useTopicState } from "../utils/useTopicState";
import { useTopicHook } from "../hooks/useTopicHook";

type TabBarProps = {
  tabs: { topic: string }[];
  activeTabIndex: number;
  onTabSelect: (index: number) => void;
  onTabClose: (index: number) => void;
};

export function TabBar({ tabs, activeTabIndex, onTabSelect, onTabClose }: TabBarProps) {

  const topics = useTopicState((state) => state.topics);
  const isSocketConnected = useTopicState(state => state.isSocketConnected)
  const { currentTopic } = useTopicHook()
  

  const updatedTabs = useMemo(() => {
    return tabs.map((tab) => {
      return {
        ...tab,
        isRealtimeEnabled: topics[tab.topic].isRealtimeEnabled
      }
    })
  }, [tabs, topics])


  if (tabs.length === 0) {
    return (
      <div className="tab-bar">
        <div className="default-tab">
          <i className="fas fa-home"></i>
          <span>Welcome - Select a topic to get started</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-bar">
      {updatedTabs.map((tab, index) => (
        <div
          key={tab.topic}
          className={`tab ${activeTabIndex === index ? 'active' : ''}`}
          onClick={() => onTabSelect(index)}
        >
          { currentTopic?.isLoading ? <i className="loading-spinner"/> :  tab.isRealtimeEnabled ? <i className="fas fa-circle" style={{color:  isSocketConnected ? 'green' : 'red'}}></i> : <i className="fas fa-list"></i>}
          
          <span className="tab-title">{tab.topic}</span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(index);
            }}
            title="Close tab"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};