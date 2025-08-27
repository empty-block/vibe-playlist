# Jamzy Overview
## Why Jamzy?
Jamzy is a social music discovery platform built on Farcaster.

Music curation and discovery is an essential part of music culture, but it has turned into a bit of a lost art. In the days before music streaming services, people would spend hours and hours finding new songs or albums and adding them to their collection. Whether it was hunting for vinyls, burning and organizing CDs, or searching for new songs on Napter, humans have long naturally gone through a process of discovering, collecting music, and sharing it with their friends.

In a post-streaming world, however, that process has effectively died. Now thanks to services like Spotify and YouTube, everyone has an endless music library at their fingerprints, and no longer have to go through the process of searching for new songs, adding them to a collection, and sharing. Now Spotify does it for you, or at least they're trying. 

Curation has now become a bigger challenge than ever. With an overload of data and music, it has become hard to know where to find new music and who to trust. Often, the most tried and true way to find good new music is still just to ask a friend who you trust has a good taste.

What if we could regain some of the lost magic of social music discovery, and combine the lost art of curation and sharing with the modern benefits of streaming music services?

## The Curation Layer

Jamzy essentially functions as a curation layer on top of existing music platforms like Spotify, YouTube, SoundCloud, etc. People naturally search for and share music everyday. 

For example, someone might discover a new song on YouTube then share the URL on their social media accounts or in groups chats. This type of sharing happends organically on Farcaster. Over the last few years, Farcaster users have shared thousands of URLs of tracks from Spotify, SoundCloud, YouTube, etc. Sometimes they're shared in dedicated Farcaster music feeds (aka channels), but they're often just posted to a user's main feed along with a short text post from the user. 

This prcoess of sharing music on Farcaster and other social media is intriguingly similar to the more old-school way of discovering and collecting music. User's naturally hunt for music, add it to their "collection" (aka their feed) by posting it, and simultaneously sharing it with their friends

## The Collective Library

## Public by Default

On Jamzy you build your library through sharing, not the other way around. Every public share becomes part of your musica library (aka your musical identity) and contributes to the community's discovery ecosystem.

Everyone's library, likes, and replies are inherently public and open, which allows for new experiences and interesting combinations of human and algorithmic curation. Since the data is publicly available on Farcaster, it is relatively easy to organize it into a database and create algorithms and/or AI agents that can help supplement human curation, and further facilitate discovery.

By extracting and organizing all the music people naturally share across these platforms on Farcaster, Jamzy enables human-centered music discovery and preserve the social context of music sharing. 

## Every Track is a Conversation

**Shared Track = Farcaster Post**: Under the hood, every shared track is actually a Farcaster post:
- Jamzy uses Farcaster posts as a data source. So if someone posts on Jamzy the backend creates a new Farcaster post with the contents of the Jamzy post. Then Jamzy pulls in all the relevant Farcaster posts to populate the Jamzy app
- When someone shares a song, they're simultaenously posting on Farcaster, aka they're starting a new conversation thread
- People can reply to the thread with their thoughts or even share more songs
- Anyone can contribute by replying with their song suggestions
- Threads can be used to effectively start playlists, by including a prompt like "What is your favrote 90s song? Mine is xyz" for example

## Tags & Playlists
Tracks in the Jamzy library can be organized into collections (aka playlists) by using tags. You can tag a group of songs with any arbitrary tag, which turns them into a playable playlist. This can also be defined with further data filters, like shared between dates x and y, or has at least X number of likes, etc. Therefore, Jamzy playlists can essentially be thought of as a combination of different tags and filters. This allows for the creation of an effectively endless amount of playlists, and also has the benefit of the playlists inherently being "smart," aka they update automatically when tags are added to new tracks. 

### Implicit vs Explicit Tags
All of a track's data can be thought of as "implicit" tags.

For example, a track's shared by user info can be an implicit tag "shared by user_xyz" where "user_xyz" can be any arbitrary user. In other words, every time someone share's a song it's inherently part of the collection of songs in their library. Similarly, the date that the track was shared on is another implicit tag, i.e. "shared on date_xyz."

### Explicit Tags
There can also be explicit tags, i.e. tags created on the backend either manually, by ai agents, or using algoritms. There can even potentially be user submitted tags as well. 

### Combinations of Tags

Tags can be combined to form a "playlist." For example, "shared by user_a," "shared by user_b," and "shared by user_c" can be combined to form a playlist of "Three Friends Jams." 

This can be combiend with data filters to get even more precise playlists, like songs shared by OG users (aka first 100 users of the platform), or songs shared in summer 2024.

Alternatively, playlists could be "Popular Hip Hop Songs" or "Songs Shared This Week." Basically any arbitray combination of tags and filters.

## What problems does Jamzy aim to solve?
- Curation and discovery are broken; there's an overload of content with a seemingly infinite amount of options, and a lack of quality curators
- There's a lost sense of collecting music since adding something to your library is trivial
- Genuine human connection is becoming harder and harder than ever in the age of social media and AI. Jamzy can help people genuinely connect over shared music and spark real conversations

## AI-as-Assistant Philosophy

Jamzy's AI features are designed to **enhance human creativity, not replace it**. Our approach positions AI as a supportive assistant that helps users express their musical vision more naturally and efficiently. AI should err on the side of being invisible, and only used explicitly if it would be beneficial as part of the UX design.

### Core Principles
- **Human-Driven Curation**: Users lead & maintain creative control 
- **Natural Language Interface**: Conversational UI eliminates manual searching and data entry
- **AI Suggests, Users Decide**: The AI provides options and explanations; users make the final choices
- **Creative Enhancement**: AI helps users discover and organize music they wouldn't find otherwise