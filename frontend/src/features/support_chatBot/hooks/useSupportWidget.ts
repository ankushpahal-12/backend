import { useSupportWidgetContext, type WidgetView } from '../context/SupportWidgetContext';

export const useSupportWidget = () => {
  const {
    isOpen,
    toggleWidget,
    openWidget,
    closeWidget,
    currentView,
    setView,
    activeTicketId,
    setActiveTicketId,
    setUnreadCount,
    unreadCount,
    conversation,
    messages,
    addMessage,
    isLoadingConversation,
    isSocketReady,
    isAuthenticated,
    userName,
  } = useSupportWidgetContext();

  const navigateTo = (view: WidgetView, ticketId?: string) => {
    setView(view);
    if (ticketId) {
      setActiveTicketId(ticketId);
    } else if (view !== 'detail') {
      setActiveTicketId(null);
    }
  };

  const navigateBack = () => {
    if (currentView === 'detail') {
      navigateTo('list');
    } else if (currentView === 'chat') {
      navigateTo('home');
    } else if (
      currentView === 'success' ||
      currentView === 'form' ||
      currentView === 'list'
    ) {
      navigateTo('home');
    }
  };

  return {
    isOpen,
    toggleWidget,
    openWidget,
    closeWidget,
    currentView,
    navigateTo,
    navigateBack,
    activeTicketId,
    setActiveTicketId,
    unreadCount,
    setUnreadCount,
    conversation,
    messages,
    addMessage,
    isLoadingConversation,
    isSocketReady,
    isAuthenticated,
    userName,
  };
};
