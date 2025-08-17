import { useEffect, useState } from 'react'
import './App.css'
import { ProduceMessageModal } from './components/ProduceMessageModal';
import { CreateTopicModal } from './components/CreateTopicModal';
import { Pagination } from './components/Pagination';
import { Filters } from './components/Filters';
import { Header } from './components/Header';
import { MessagesTable } from './components/MessageTable';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import socket from './utils/socket';
import { addNewMessage, fetchTopicOffsets } from './utils/functions';
import { useTopicState, type MessageType, type TabType } from './utils/useTopicState';
import { toast, ToastContainer } from 'react-toastify';
import { useTopicHook } from './hooks/useTopicHook';


function App() {
  // const [theme, setTheme] = useState('dark');
  const theme = useTopicState((state) => state.theme)
  const setTheme = (theme: string) => useTopicState.setState({ theme })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const tabs = useTopicState((state) => state.tabs);
  const setTabs = (tabs: TabType[] | CallableFunction) => {
    if (typeof tabs === 'function') {
      useTopicState.setState((state) => ({
        tabs: tabs(state.tabs as TabType[])
      }));
    }
    else {
      useTopicState.setState({ tabs });
    }
  };
  const activeTabIndex = useTopicState((state) => state.activeTabIndex);
  const setActiveTabIndex = (index: number) => {
    useTopicState.setState({ activeTabIndex: index });
  };
  const [produceModalOpen, setProduceModalOpen] = useState(false);
  const [createTopicModalOpen, setCreateTopicModalOpen] = useState(false);
  const { currentTopic, isRealtimeEnabled, filteredMessages, totalPages, currentTab, getPageOffset, searchQuery, realtimeTopics } = useTopicHook();
  const isSocketConnected = useTopicState(state => state.isSocketConnected)

  useEffect(() => {
    useTopicState.setState({
      currentTab: activeTabIndex >= 0 ? tabs[activeTabIndex] : null
    });
  }, [activeTabIndex, tabs])
  // Set theme
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const createTabState = (): Omit<TabType, 'topic'> => ({
    expandedRows: new Set<number>(),
    currentPage: 1,
    loading: false
  });

  const handleTopicOpen = (topic: string) => {
    // Check if tab already exists
    const existingTabIndex = tabs.findIndex(tab => tab.topic === topic);
    if (existingTabIndex >= 0) {
      // Switch to existing tab
      setActiveTabIndex(existingTabIndex);
    } else {
      // Create new tab
      const newTab = {
        topic,
        ...createTabState()
      };
      setTabs((prev: TabType[]) => [...prev, newTab]);
      setActiveTabIndex(tabs.length);
    }
    fetchTopicOffsets(topic);
  };

  const handleTabSelect = (index: number) => {
    setActiveTabIndex(index);
  };

  const handleTabClose = (index: number) => {

    // clear state store
    useTopicState.setState((state) => {
      const newTopics = { ...state.topics };

      if (newTopics[currentTopic!.name]) {
        delete newTopics[currentTopic!.name];
      } else {
        newTopics[currentTopic!.name] = state.topics[currentTopic!.name]
      }

      return { topics: newTopics };
    });


    if (tabs.length === 1) {
      // Closing the last tab
      setTabs([]);
      setActiveTabIndex(-1);
    } else if (index === activeTabIndex) {
      // Closing the active tab
      const newTabs = tabs.filter((_, i) => i !== index);
      setTabs(newTabs);
      setActiveTabIndex(index > 0 ? index - 1 : 0);
    } else if (index < activeTabIndex) {
      // Closing a tab before the active tab
      const newTabs = tabs.filter((_, i) => i !== index);
      setTabs(newTabs);
      setActiveTabIndex(activeTabIndex - 1);
    } else {
      // Closing a tab after the active tab
      const newTabs = tabs.filter((_, i) => i !== index);
      setTabs(newTabs);
    }
  };

  const updateCurrentTab = (updates: Partial<TabType>) => {
    if (activeTabIndex >= 0) {
      setTabs((prev: TabType[]) => prev.map((tab, index) =>
        index === activeTabIndex ? { ...tab, ...updates } : tab
      ));
    }
  };



  const handleToggleExpand = (offset: number) => {
    const newExpandedRows = new Set(currentTab?.expandedRows);
    if (newExpandedRows.has(offset)) {
      newExpandedRows.delete(offset);
    } else {
      newExpandedRows.add(offset);
    }
    updateCurrentTab({ expandedRows: newExpandedRows });
  };


  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    if (searchQuery.length > 0) {
      //  no need to call api for search results
      updateCurrentTab({ currentPage: page, loading: false });
      return;
    } else {
      const pagination = getPageOffset(page);
      // console.log(pagination)
      if (!pagination || pagination.end === pagination.start) {
        toast.error('No messages available for the selected partition');
        updateCurrentTab({ loading: false });
        return;
      }
      
      // toast.promise(
      //   fetchMessages(currentTab?.topic ?? '', pagination.partition, pagination.start, pagination.end),
      //   {
      //     pending: `Loading ${pagination.totalMessages < pagination.limit ? 'all ' : ''} messages for "${currentTopic?.name} (${pagination.partition})" ${pagination.totalMessages > pagination.limit ? ('page ' + page + '...') : ''}`,
      //     success: 'Messages loaded successfully',
      //     error: 'Failed to load messages'
      //   }
      // ).finally(() => {
      //   updateCurrentTab({ currentPage: page, loading: false });
      // })


      const config = {
        id: socket.id, topic: currentTab?.topic, startOffset: pagination.start, endOffset: pagination.end, partition: pagination.partition
      }
      socket.emit('list_messages', config)

      updateCurrentTab({ currentPage: page, loading: false });
      if (currentTopic) {
      useTopicState.setState((state) => ({
            topics: {
                ...state.topics,
                [currentTopic?.name]: {
                    ...state.topics[currentTopic?.name],
                    isLoading: true
                }
            }
        }));
      }
    }
  };

  const handleLoadMessages = async () => {
    // updateCurrentTab({ loading: true });
    handlePageChange(1) // reset to page 1
  };

  // usually this triggers laod message on initial topic selection
  // useEffect(() => {
  //   handleLoadMessages()
  // }, [currentTopic?.selectedPartition])

  const handleRealtimeToggle = (enabled: boolean) => {
    if (currentTopic) {
      useTopicState.setState((state) => ({
        topics: {
          ...state.topics,
          [currentTopic.name]: {
            ...state.topics[currentTopic.name],
            isRealtimeEnabled: enabled
          }
        }
      }));
    }
  };

  const clearMessages = () => {
    if (!currentTopic) return
    useTopicState.setState((state) => ({
      topics: {
        ...state.topics,
        [currentTopic.name]: {
          ...state.topics[currentTopic.name],
          messages: [] // reset the messages
        }
      }
    }));
  }

  useEffect(() => {
    if (isSocketConnected) {
      // check if there are any realtime listeners if thers are listeners 
      // update the server as well
      socket.emit('realtime', { id: socket.id, topics: realtimeTopics })
    }

  }, [isSocketConnected, realtimeTopics])

  useEffect(() => {
    socket.on("welcome", (data) => {
      const socketId = data.id
      console.log(socketId, 'connected.')
      useTopicState.setState({ isSocketConnected: true })
    })

    socket.on('realtime', async ({ topic, data }: { topic: string, data: unknown }) => {
      await addNewMessage(topic, [data as MessageType])
    })
    // list_messages
    socket.on('list_messages', async ({ topic, data }: { topic: string, data: unknown }) => {
      await addNewMessage(topic, [data as MessageType])
    })

    socket.on('disconnect', () => {
      useTopicState.setState({ isSocketConnected: false })
    })

    return () => {
      socket.removeAllListeners()
    };
  }, []);

  return (
    <div className="kafka-ui">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="main-wrapper">
        <Sidebar
          collapsed={sidebarCollapsed}
          tabs={tabs}
          activeTabIndex={activeTabIndex}
          onTopicOpen={handleTopicOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          toggleSidebar={toggleSidebar}
        />

        <div className="main-content">
          <TabBar
            tabs={tabs}
            activeTabIndex={activeTabIndex}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
          />

          {currentTab ? (
            <>
              <div className="content-header">
                <div className="breadcrumb">
                  Topics / {currentTab.topic}
                </div>
                <div className="content-controls">
                  <div className="realtime-toggle">
                    <span>Realtime Messages</span>
                    <label className="toggle-switch">
                      <input disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}
                        type="checkbox"
                        checked={isRealtimeEnabled}
                        onChange={(e) => handleRealtimeToggle(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  {/* <button className="btn btn--primary btn--sm" onClick={handleLoadMessages} disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}>
                    <i className="fas fa-sync-alt" style={{ paddingRight: 8 }}></i> Load/ReLoad Messages
                  </button> */}
                  <button className="btn btn--primary btn--sm" onClick={() => setProduceModalOpen(true)} disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}>
                    <i className="fas fa-plus-circle" style={{ paddingRight: 8 }}></i> Produce Message
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={clearMessages} disabled={!currentTopic?.isLoaded || currentTopic?.isLoading}>
                    <i className="fas fa-trash" style={{ paddingRight: 8 }}></i> Clear
                  </button>
                </div>
              </div>

              <Filters />

              <MessagesTable
                onOpenProduceModal={() => setProduceModalOpen(true)}
                onLoadMessages={handleLoadMessages}
                messages={filteredMessages}
                expandedRows={currentTab.expandedRows}
                onToggleExpand={handleToggleExpand}
                loading={currentTab.loading}
              />

              <Pagination
                currentPage={currentTab.currentPage}
                totalLoadedPages={totalPages}
                totalServerPages={getPageOffset(currentTab.currentPage)?.pages ?? 0}
                isSearching={searchQuery.length > 0}
                onPageChange={handlePageChange}
                loading={currentTab.loading}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-content">
                <i className="fas fa-stream"></i>
                <h2>Welcome to Kafka UI Manager</h2>
                <p>Select a topic from the sidebar to get started</p>
                <button className="btn btn--primary" style={{ height: 60 }} onClick={() => setCreateTopicModalOpen(true)}>
                  <i className="fas fa-plus-circle" style={{ fontSize: 40, marginRight: 10, marginTop: 25, color: '#ffffff' }}></i> <span style={{ color: '#ffffff' }}>Create New Topic</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProduceMessageModal
        isOpen={produceModalOpen}
        onClose={() => setProduceModalOpen(false)}
        selectedTopic={currentTab?.topic ?? null}
      />

      <CreateTopicModal
        isOpen={createTopicModalOpen}
        onClose={() => setCreateTopicModalOpen(false)}
      />
      <ToastContainer theme={'light'} />
    </div>
  );
}

export default App
