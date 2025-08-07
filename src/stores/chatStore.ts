import { createSignal } from 'solid-js';

// Global chat visibility state
export const [showChat, setShowChat] = createSignal(false);

export const toggleChat = () => {
  setShowChat(!showChat());
};

export const openChat = () => {
  setShowChat(true);
};

export const closeChat = () => {
  setShowChat(false);
};