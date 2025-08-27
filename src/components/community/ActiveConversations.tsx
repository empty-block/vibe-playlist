import { Component, For, Show, createSignal } from 'solid-js';
import { ActiveConversation } from '../../types/community';

interface ActiveConversationsProps {
  conversations: ActiveConversation[];
  isLoading: boolean;
}

const ActiveConversations: Component<ActiveConversationsProps> = (props) => {
  const [expandedConversation, setExpandedConversation] = createSignal<string | null>(null);
  const [replyContent, setReplyContent] = createSignal('');
  const [replyingTo, setReplyingTo] = createSignal<string | null>(null);

  const toggleExpansion = (conversationId: string) => {
    setExpandedConversation(
      expandedConversation() === conversationId ? null : conversationId
    );
    setReplyingTo(null);
    setReplyContent('');
  };

  const startReply = (conversationId: string) => {
    setReplyingTo(conversationId);
    setExpandedConversation(conversationId);
  };

  const handleReply = (conversationId: string) => {
    if (replyContent().trim()) {
      console.log('Replying to conversation:', conversationId, 'with:', replyContent());
      setReplyContent('');
      setReplyingTo(null);
      // TODO: Add reply to conversation
    }
  };

  const handleSocialAction = (action: string, conversationId: string, trackId?: string) => {
    console.log(`${action} action on`, conversationId, trackId);
    // TODO: Implement social actions
  };

  return (
    <div class="active-conversations">
      <Show
        when={!props.isLoading}
        fallback={
          <div class="space-y-6">
            <For each={[1, 2, 3]}>
              {() => (
                <div class="conversation-skeleton animate-pulse bg-slate-800/40 border border-purple-400/10 rounded-xl p-6">
                  <div class="flex gap-4 mb-4">
                    <div class="w-16 h-16 bg-purple-400/20 rounded-lg"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-5 bg-purple-400/20 rounded w-3/4"></div>
                      <div class="h-4 bg-purple-400/20 rounded w-1/2"></div>
                      <div class="h-3 bg-purple-400/20 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="h-4 bg-purple-400/20 rounded w-full"></div>
                    <div class="h-12 bg-purple-400/20 rounded"></div>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div class="space-y-6">
          <For each={props.conversations}>
            {(conversation) => {
              const isExpanded = expandedConversation() === conversation.id;
              const isReplying = replyingTo() === conversation.id;
              
              return (
                <div class="conversation-card group">
                  <div class="bg-gradient-to-b from-slate-800/60 to-slate-700/40 hover:from-slate-700/80 hover:to-slate-600/60 border-2 border-purple-400/20 hover:border-purple-400/40 rounded-xl p-6 transition-all duration-300">
                    
                    {/* Track Header */}
                    <div class="track-header flex items-start gap-4 mb-4">
                      {/* Track Artwork */}
                      <div class="track-artwork flex-shrink-0 relative">
                        <img 
                          src={conversation.trackShare.track.thumbnail} 
                          alt={conversation.trackShare.track.title}
                          class="w-16 h-16 rounded-lg shadow-lg object-cover border border-purple-400/30 group-hover:border-purple-400/50 transition-colors duration-300"
                        />
                        <div class="absolute inset-0 bg-purple-400/0 group-hover:bg-purple-400/10 rounded-lg transition-colors duration-300"></div>
                        <button 
                          class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={() => console.log('Play track:', conversation.trackShare.track.id)}
                        >
                          <div class="w-8 h-8 bg-purple-500/80 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            <i class="fas fa-play text-sm"></i>
                          </div>
                        </button>
                      </div>

                      {/* Track Info */}
                      <div class="track-info flex-1 min-w-0">
                        <div class="track-title text-white font-semibold text-lg mb-1 group-hover:text-purple-300 transition-colors duration-300">
                          {conversation.trackShare.track.title}
                        </div>
                        <div class="track-artist text-purple-300/80 text-base mb-2">
                          {conversation.trackShare.track.artist}
                        </div>
                        
                        {/* Shared by info */}
                        <div class="shared-by flex items-center gap-2 text-sm text-purple-400/80">
                          <img 
                            src={conversation.trackShare.sharedBy.avatar} 
                            alt={conversation.trackShare.sharedBy.displayName}
                            class="w-5 h-5 rounded-full border border-purple-400/30"
                          />
                          <span class="font-medium">{conversation.trackShare.sharedBy.displayName}</span>
                          <span>shared</span>
                          <span>•</span>
                          <span>{conversation.trackShare.timeAgo}</span>
                          <Show when={conversation.trackShare.sharedBy.isOnline}>
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                          </Show>
                        </div>
                      </div>

                      {/* Track metadata */}
                      <div class="track-meta text-right flex-shrink-0">
                        <div class="text-purple-300 text-sm font-mono mb-1">
                          {conversation.trackShare.track.duration}
                        </div>
                        <div class="text-purple-400/60 text-xs font-mono capitalize">
                          {conversation.trackShare.track.source}
                        </div>
                      </div>
                    </div>

                    {/* Original Comment */}
                    <Show when={conversation.trackShare.originalComment}>
                      <div class="original-comment bg-purple-400/5 border border-purple-400/20 rounded-lg p-4 mb-4">
                        <div class="text-purple-200/90 leading-relaxed">
                          {conversation.trackShare.originalComment}
                        </div>
                      </div>
                    </Show>

                    {/* Social Stats */}
                    <div class="social-stats flex items-center justify-between mb-4">
                      <div class="flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-1 text-pink-400">
                          <i class="fas fa-heart text-xs"></i>
                          <span class="font-mono">{conversation.trackShare.socialStats.hearts}</span>
                        </div>
                        <div class="flex items-center gap-1 text-cyan-400">
                          <i class="fas fa-comment text-xs"></i>
                          <span class="font-mono">{conversation.trackShare.socialStats.replies}</span>
                        </div>
                        <div class="flex items-center gap-1 text-green-400">
                          <i class="fas fa-share text-xs"></i>
                          <span class="font-mono">{conversation.trackShare.socialStats.shares}</span>
                        </div>
                        <div class="flex items-center gap-1 text-yellow-400">
                          <i class="fas fa-retweet text-xs"></i>
                          <span class="font-mono">{conversation.trackShare.socialStats.recasts}</span>
                        </div>
                      </div>
                      
                      <div class="text-xs text-purple-400/60 font-mono">
                        {conversation.participantCount} participants • {conversation.replyCount} replies
                      </div>
                    </div>

                    {/* Reply Preview */}
                    <Show when={conversation.replies.length > 0 && !isExpanded}>
                      <div class="reply-preview space-y-2 mb-4">
                        <For each={conversation.replies.slice(0, 2)}>
                          {(reply) => (
                            <div class="reply-item flex items-start gap-3 p-3 bg-purple-400/5 rounded-lg">
                              <img 
                                src={reply.user.avatar} 
                                alt={reply.user.displayName}
                                class="w-8 h-8 rounded-full border border-purple-400/30"
                              />
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                  <span class="text-purple-300 font-medium text-sm">{reply.user.displayName}</span>
                                  <span class="text-purple-400/60 text-xs">•</span>
                                  <span class="text-purple-400/60 text-xs">{reply.timeAgo}</span>
                                </div>
                                <div class="text-purple-200/90 text-sm leading-relaxed">
                                  {reply.content}
                                </div>
                                <Show when={reply.hearts > 0}>
                                  <div class="flex items-center gap-1 mt-2 text-pink-400/70 text-xs">
                                    <i class="fas fa-heart"></i>
                                    <span>{reply.hearts}</span>
                                  </div>
                                </Show>
                              </div>
                            </div>
                          )}
                        </For>
                        
                        <Show when={conversation.replies.length > 2}>
                          <button 
                            class="text-purple-400 hover:text-purple-300 text-sm font-medium"
                            onClick={() => toggleExpansion(conversation.id)}
                          >
                            View {conversation.replies.length - 2} more replies
                          </button>
                        </Show>
                      </div>
                    </Show>

                    {/* Full Conversation (Expanded) */}
                    <Show when={isExpanded}>
                      <div class="full-conversation space-y-3 mb-4 max-h-96 overflow-y-auto">
                        <For each={conversation.replies}>
                          {(reply) => (
                            <div class="reply-item flex items-start gap-3 p-3 bg-purple-400/5 hover:bg-purple-400/10 rounded-lg transition-colors duration-200">
                              <img 
                                src={reply.user.avatar} 
                                alt={reply.user.displayName}
                                class="w-8 h-8 rounded-full border border-purple-400/30"
                              />
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                  <span class="text-purple-300 font-medium text-sm">{reply.user.displayName}</span>
                                  <span class="text-purple-400/60 text-xs">•</span>
                                  <span class="text-purple-400/60 text-xs">{reply.timeAgo}</span>
                                  <Show when={reply.user.isOnline}>
                                    <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                  </Show>
                                </div>
                                <div class="text-purple-200/90 text-sm leading-relaxed mb-2">
                                  {reply.content}
                                </div>
                                <div class="flex items-center gap-3">
                                  <button 
                                    class={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                                      reply.hasCurrentUserHearted 
                                        ? 'text-pink-400' 
                                        : 'text-pink-400/50 hover:text-pink-400'
                                    }`}
                                    onClick={() => handleSocialAction('heart-reply', conversation.id, reply.id)}
                                  >
                                    <i class="fas fa-heart"></i>
                                    <span>{reply.hearts}</span>
                                  </button>
                                  <button class="text-cyan-400/50 hover:text-cyan-400 text-xs transition-colors duration-200">
                                    <i class="fas fa-reply mr-1"></i>
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>

                    {/* Reply Input */}
                    <Show when={isReplying}>
                      <div class="reply-input bg-purple-400/5 border border-purple-400/30 rounded-lg p-4 mb-4">
                        <div class="flex gap-3">
                          <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=hendrix_69" 
                            alt="Your avatar"
                            class="w-8 h-8 rounded-full border border-purple-400/30"
                          />
                          <div class="flex-1">
                            <textarea
                              placeholder="Share your thoughts..."
                              value={replyContent()}
                              onInput={(e) => setReplyContent(e.currentTarget.value)}
                              class="w-full bg-black/40 border border-purple-400/30 focus:border-purple-400 rounded-lg p-3 text-white placeholder-purple-400/50 resize-none focus:outline-none transition-colors duration-300"
                              rows="3"
                            />
                            <div class="flex items-center justify-between mt-3">
                              <div class="text-xs text-purple-400/60">
                                {replyContent().length}/280
                              </div>
                              <div class="flex gap-2">
                                <button 
                                  class="px-4 py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors duration-200"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </button>
                                <button 
                                  class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-sm rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                                  onClick={() => handleReply(conversation.id)}
                                  disabled={!replyContent().trim()}
                                >
                                  <i class="fas fa-paper-plane mr-2"></i>
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Show>

                    {/* Action Buttons */}
                    <div class="action-buttons flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <button 
                          class={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            conversation.trackShare.hasCurrentUserHearted
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-400/40'
                              : 'bg-pink-400/10 text-pink-400/70 hover:text-pink-400 hover:bg-pink-400/20 border border-pink-400/20 hover:border-pink-400/40'
                          }`}
                          onClick={() => handleSocialAction('heart', conversation.id, conversation.trackShare.trackId)}
                        >
                          <i class="fas fa-heart"></i>
                          <span class="text-sm">Heart</span>
                        </button>

                        <button 
                          class="flex items-center gap-2 px-3 py-2 bg-cyan-400/10 text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/20 border border-cyan-400/20 hover:border-cyan-400/40 rounded-lg transition-all duration-200"
                          onClick={() => startReply(conversation.id)}
                        >
                          <i class="fas fa-comment"></i>
                          <span class="text-sm">Reply</span>
                        </button>

                        <button 
                          class="flex items-center gap-2 px-3 py-2 bg-green-400/10 text-green-400/70 hover:text-green-400 hover:bg-green-400/20 border border-green-400/20 hover:border-green-400/40 rounded-lg transition-all duration-200"
                          onClick={() => handleSocialAction('share', conversation.id, conversation.trackShare.trackId)}
                        >
                          <i class="fas fa-share"></i>
                          <span class="text-sm">Share</span>
                        </button>

                        <button 
                          class={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            conversation.trackShare.hasCurrentUserRecast
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/40'
                              : 'bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-400/20 border border-yellow-400/20 hover:border-yellow-400/40'
                          }`}
                          onClick={() => handleSocialAction('recast', conversation.id, conversation.trackShare.trackId)}
                        >
                          <i class="fas fa-retweet"></i>
                          <span class="text-sm">Recast</span>
                        </button>
                      </div>

                      <button 
                        class="text-purple-400/60 hover:text-purple-400 text-sm transition-colors duration-200"
                        onClick={() => toggleExpansion(conversation.id)}
                      >
                        {isExpanded ? (
                          <>
                            <i class="fas fa-chevron-up mr-1"></i>
                            Collapse
                          </>
                        ) : (
                          <>
                            <i class="fas fa-chevron-down mr-1"></i>
                            View full conversation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default ActiveConversations;