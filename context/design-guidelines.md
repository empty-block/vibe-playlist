# Jamzy Design Guidelines

## 🎨 Design Philosophy

### Core Design Principles

1. **Conversation-Centric**: Every song is a conversation starter - design for thread-based interactions
2. **Sharing-First Library Building**: Your collection grows through sharing, not adding - emphasize public discovery  
3. **Human Curation Enhanced by AI**: AI suggests, humans decide - show AI reasoning transparently
4. **Collections as Living Tags**: Playlists are dynamic, algorithmic, and community-driven
5. **Retro Aesthetics with Social Purpose**: 90s nostalgia serves discovery and connection, not decoration
6. **Farcaster-Native**: Design for decentralized social interactions and public conversations
7. **Professional High-quality Look**: AVOID tacky designs and do not lean too much into skeumorphism or overly literal designs

## 🎯 Visual Identity

### Neon 90s Color Palette

```css
/* Primary Brand Colors */
--neon-blue: #3b00fd    /* Deep Blue/Violet - Primary brand, main CTAs */
--neon-green: #00f92a   /* Bright Green - Success states, play buttons */
--neon-cyan: #04caf4    /* Bright Cyan - Links, info, interactive elements */
--neon-pink: #f906d6    /* Bright Pink - Special emphasis, accents */
--neon-orange: #ff9b00  /* Orange - Text highlights, active states */
--neon-yellow: #d1f60a  /* Yellow - Warnings and alerts ONLY */

/* Supporting Colors */
--dark-bg: #1a1a1a      /* Primary background */
--darker-bg: #0f0f0f    /* Deeper background areas */
--light-text: #ffffff   /* Primary text */
--muted-text: #cccccc   /* Secondary text */
```

### Color Usage Guidelines

- **Primary Actions**: Neon blue gradients for main CTAs and branding
- **Success & Play States**: Neon green for confirmations, play buttons, positive feedback
- **Interactive Elements**: Neon cyan for links, hover states, navigation
- **Special Emphasis**: Neon pink sparingly for unique features, special callouts
- **Text Highlights**: Neon orange for readable emphasis, active states, current selections
- **Warnings Only**: Neon yellow exclusively for errors, warnings, urgent alerts

## 💬 Conversation UI Patterns

### Thread-Based Music Sharing
- **Song Cards**: Always show reply count and conversation preview
- **Thread Views**: Nested replies with clear visual hierarchy
- **Contribution Indicators**: Visual cues showing who added songs to conversations
- **Reply Prompts**: Encourage musical responses with contextual suggestions

### Social Context Display
- **Sharer Attribution**: Prominent display of who discovered/shared each track
- **Conversation Starters**: Design templates for music discovery prompts  
- **Community Indicators**: Show which songs sparked the most discussion
- **Farcaster Integration**: Native Farcaster reply and engagement patterns

## 🎵 Discovery & Collection Patterns

### Library as Shared Identity
- **Discovery Feed**: Chronological stream of community music shares
- **Personal Collections**: User's musical identity through their shares
- **Tag-Based Playlists**: Dynamic collections based on user-generated tags
- **Algorithmic Collections**: AI-generated playlists with transparent reasoning

### AI-Enhanced Discovery
- **Suggestion Cards**: AI recommendations with clear "why this song?" explanations
- **Natural Language Search**: Conversational search interface ("find me chill 90s indie")
- **Contextual Prompts**: AI-generated conversation starters for sharing
- **Human-AI Collaboration**: Show how AI builds on human curation

## 🤖 AI-as-Assistant Design Patterns

### Transparent AI Interactions
- **Reasoning Display**: Always show why AI suggested something
- **Human Override**: Easy ways to modify or reject AI suggestions
- **Learning Feedback**: UI for training AI on user preferences

### Conversational AI Elements
- **Chat Interfaces**: Terminal/messenger styling for AI interactions
- **Progressive Disclosure**: Reveal AI capabilities gradually
- **Natural Language Inputs**: Free-form text with smart parsing
- **Suggestion Previews**: Show AI options before committing

## 🖼️ Component Design Language

### Retro-Modern Components
- **Window Chrome**: 90s OS-inspired frames for major sections
- **Neon Glow Effects**: Interactive feedback with animated shadows
- **Gradient Backgrounds**: Depth through color transitions
- **Chunky Controls**: Touch-friendly retro buttons and sliders

### Social Elements
- **Contributor Avatars**: Stacked avatars showing conversation participants
- **Reaction Buttons**: Heart, reply, share with neon hover effects
- **Comment Threads**: Nested replies with connector lines
- **Discovery Badges**: Visual indicators for trending conversations

### Reusable Social Components

**`SocialStats.tsx`** - Unified display for likes/recasts/replies
```typescript
<SocialStats
  likes={track.likes}
  recasts={track.recasts} 
  replies={track.replies}
  size="sm|md|lg"
  showLabels={true|false}
  interactive={true}  // Makes buttons clickable
  onLikeClick={() => handleLike()}
  onRepliesClick={() => showReplies()}
/>
```

**`SocialActions.tsx`** - Reusable action buttons
```typescript
<SocialActions
  onLike={() => likeTrack()}
  onAdd={() => addToPlaylist()}
  onShare={() => shareTrack()}
  size="sm|md|lg"
  variant="buttons|links"  // Win95 buttons or simple links
/>
```

**`ReplyItem.tsx`** - Standardized reply formatting
```typescript
<ReplyItem
  reply={replyData}
  variant="default|compact|modal"  // Different contexts
  onLike={(id) => likeReply(id)}
  onReply={(id) => replyTo(id)}
/>
```

## ⚡ Animation & Interaction

### Animation System (anime.js v3.2.1)
The app uses **anime.js v3.2.1** for smooth, hardware-accelerated animations. All animation utilities are centralized in `src/utils/animations.ts`.

**Version Requirements**:
- **Use v3.2.1**: Stable version with reliable module imports
- **Avoid v4.x**: Has module export issues in our build setup
- **Installation**: `bun add animejs@3.2.1`

### Core Animation Patterns

**Player Controls**: Gradient hover effects with icon color changes
```typescript
// Player buttons get gradient backgrounds + white icons on hover
playbackButtonHover.enter(buttonElement);
```

**Track Interactions**:
- Hover scale effects with proper container padding
- Current track gets neon blue border with multi-layer glow
- Particle burst effects on play button clicks
- Magnetic effects on thumbnails

**Page Transitions**: Staggered fade-ins, page entrance animations, floating elements

### Animation Architecture
- **Centralized utilities**: All animations in `src/utils/animations.ts`
- **Ref-based**: Uses SolidJS refs for direct DOM manipulation
- **Hardware acceleration**: `transform: translateZ(0)` for smooth performance
- **CSS transition override**: `transition: 'none'` to prevent conflicts

### Implementation Patterns
```typescript
// Always disable CSS transitions for anime.js elements
element.style.transition = 'none';

// Reset transforms after animations complete
complete: () => {
  element.style.transform = 'translateZ(0)';
}

// Proper cleanup in leave animations
leave: (element) => {
  element.style.background = '';
  element.style.color = '';
}
```

### Critical Layout Considerations
- **Container padding**: Track containers need `px-2` for hover scale effects
- **Border visibility**: Current track uses `border-4` + multi-layer shadows
- **Stagger conflicts**: Don't mix individual item animations with container staggered animations

### Interaction Feedback
- **Click Response**: Immediate visual confirmation with particle bursts
- **Loading States**: Animated indicators with personality
- **Success Feedback**: Green glow pulse for completed actions
- **Error Handling**: Clear messaging with recovery suggestions

## 🔤 Typography

### Font Hierarchy
- **Display**: Retro digital fonts for headers and branding
- **Interface**: Clean, readable system fonts for UI text
- **Monospace**: Terminal-style fonts for AI interactions
- **Social Text**: Optimized for conversation readability

### Text Treatment
- **Neon Accents**: Selective use of color with glow effects
- **Readable Contrast**: WCAG AA compliance minimum
- **Clear Hierarchy**: Distinct sizes for navigation levels
- **Interactive Cues**: Hover states for clickable text

## 📐 Layout Principles

### Grid & Spacing
- **8px Base Unit**: Consistent spacing multiples
- **Content Zones**: Clear separation between social and player areas
- **Responsive Scaling**: Mobile-first with desktop enhancement
- **Thread Nesting**: Visual indent system for conversation depth

### Information Architecture
- **Discovery First**: Feed and collections prominent
- **Player Persistent**: Always accessible transport controls
- **Social Context**: User attribution visible at all times
- **AI Assistant**: Accessible but not intrusive

## ✨ Special Effects & Polish

### Neon Glow System
- Apply glows purposefully to highlight social interactions
- Use color-coded glows for different interaction types
- Animate glow intensity for state changes
- Reserve intense glows for special achievements

### Retro Polish
- **CRT Effects**: Subtle scan lines for nostalgic feel
- **Pixel Accents**: Dotted borders and pixelated icons
- **Terminal Styling**: Monospace fonts and cursor blinks for AI
- **Cassette Metaphors**: Loading bars as tape reels

## 📱 Responsive Considerations

### Mobile-First Social
- **Touch Targets**: Minimum 44px for all interactive elements
- **Swipe Gestures**: Navigate between collections and threads
- **Simplified Chrome**: Focus on content over decoration
- **Quick Actions**: Thumb-accessible sharing and reactions

### Desktop Enhancements
- **Multi-Panel Views**: Side-by-side discovery and player
- **Keyboard Navigation**: Full keyboard support for power users
- **Rich Previews**: Hover cards with song details
- **Drag & Drop**: Reorder collections and build playlists

## 🎯 Quality Standards

### Performance
- **60fps Animations**: Hardware acceleration required
- **Lazy Loading**: Progressive content loading
- **Optimized Images**: Responsive artwork delivery
- **Minimal Reflows**: Batch DOM updates

### Accessibility
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Readers**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG AA minimum compliance
- **Focus Indicators**: Clear visual focus states

---

*These guidelines focus on Jamzy's unique identity as a social music discovery platform where every song starts a conversation and sharing builds your library. When implementing new features, prioritize human connection, conversation threading, and AI that enhances rather than replaces human creativity.*