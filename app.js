        // Terminal function - defined early for HTML onclick access
        function showTerminal() {
            console.log('Terminal activated!') // Debug log
            const terminal = document.getElementById('terminal-screen')
            if (terminal) {
                terminal.style.display = 'block'
                const input = document.getElementById('terminal-input')
                if (input) {
                    setTimeout(() => input.focus(), 100) // Small delay to ensure element is visible
                }
                if (window.addTerminalLine) {
                    window.addTerminalLine('System exited. Terminal mode activated.')
                }
            } else {
                console.error('Terminal screen element not found!')
            }
        }
        
        // Make it globally accessible
        window.showTerminal = showTerminal
        
        const themes = {
            retro85: {
                name: "VIBES '85",
                colors: {
                    bg: 'linear-gradient(135deg, #0f0f23 0%, #240046 50%, #3c096c 100%)',
                    primary: '#ff0080',
                    secondary: '#00ffff',
                    accent: '#ffff00',
                    text: '#ffffff',
                    panel: 'rgba(0, 0, 0, 0.3)'
                },
                fonts: {
                    main: 'Orbitron',
                    mono: 'Courier Prime'
                },
                effects: {
                    glow: '0 0 20px currentColor',
                    border: '2px solid #00ffff',
                    animation: 'neon-pulse 2s ease-in-out infinite alternate'
                }
            },
            grunge90s: {
                name: "VIBES '92",
                colors: {
                    bg: 'linear-gradient(45deg, #2d1b69 0%, #0f0f0f 50%, #8b0000 100%)',
                    primary: '#ff6b35',
                    secondary: '#f7931e',
                    accent: '#ffec8b',
                    text: '#ffffff',
                    panel: 'rgba(139, 0, 0, 0.2)'
                },
                fonts: {
                    main: 'Impact',
                    mono: 'Courier New'
                },
                effects: {
                    glow: '0 0 10px #ff6b35',
                    border: '3px solid #f7931e',
                    animation: 'none'
                }
            },
            windows95: {
                name: "VIBES '95",
                colors: {
                    bg: '#008080',
                    primary: '#c0c0c0',
                    secondary: '#0000ff',
                    accent: '#ffff00',
                    text: '#000000',
                    panel: '#c0c0c0'
                },
                fonts: {
                    main: 'VT323',
                    mono: 'Courier New'
                },
                effects: {
                    glow: 'none',
                    border: '2px outset #c0c0c0',
                    animation: 'none'
                }
            },
            y2k: {
                name: "VIBES 2000",
                colors: {
                    bg: 'linear-gradient(45deg, #000000 0%, #001100 50%, #003300 100%)',
                    primary: '#00ff00',
                    secondary: '#0099ff',
                    accent: '#ff0099',
                    text: '#00ff00',
                    panel: 'rgba(0, 50, 0, 0.8)'
                },
                fonts: {
                    main: 'Courier New',
                    mono: 'Courier New'
                },
                effects: {
                    glow: '0 0 15px #00ff00',
                    border: '1px solid #00ff00',
                    animation: 'matrix-rain 2s linear infinite'
                }
            },
            ipod2005: {
                name: "VIBES 2005",
                colors: {
                    bg: 'linear-gradient(145deg, #f0f0f0 0%, #ffffff 50%, #e0e0e0 100%)',
                    primary: '#007aff',
                    secondary: '#5856d6',
                    accent: '#ff3b30',
                    text: '#000000',
                    panel: 'rgba(255, 255, 255, 0.9)'
                },
                fonts: {
                    main: 'Helvetica Neue, Arial',
                    mono: 'Monaco, Consolas'
                },
                effects: {
                    glow: '0 2px 10px rgba(0, 122, 255, 0.3)',
                    border: '1px solid #007aff',
                    animation: 'none'
                }
            },
            myspace2007: {
                name: "VIBES 2007",
                colors: {
                    bg: 'linear-gradient(45deg, #ff1493 0%, #00bfff 50%, #ffd700 100%)',
                    primary: '#ff69b4',
                    secondary: '#00bfff',
                    accent: '#ffd700',
                    text: '#ffffff',
                    panel: 'rgba(255, 20, 147, 0.2)'
                },
                fonts: {
                    main: 'Fredoka One',
                    mono: 'Courier New'
                },
                effects: {
                    glow: '0 0 20px #ff69b4, 0 0 30px #00bfff',
                    border: '3px solid #ffd700',
                    animation: 'rainbow-pulse 3s ease-in-out infinite'
                }
            },
            skeuomorphic: {
                name: "VIBES 2012",
                colors: {
                    bg: 'linear-gradient(145deg, #2c3e50 0%, #3498db 100%)',
                    primary: '#3498db',
                    secondary: '#2ecc71',
                    accent: '#e74c3c',
                    text: '#ffffff',
                    panel: 'rgba(52, 73, 94, 0.9)'
                },
                fonts: {
                    main: 'Righteous',
                    mono: 'Monaco'
                },
                effects: {
                    glow: '0 4px 15px rgba(52, 152, 219, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    animation: 'subtle-glow 4s ease-in-out infinite'
                }
            }
        }

        // YouTube API Configuration
        const YOUTUBE_API_KEY = 'AIzaSyDummyKeyReplaceWithReal' // Replace with your actual API key
        
        // Themed Playlists System
        const playlists = {
            '90s_hits': {
                id: '90s_hits',
                name: '90s Hits',
                description: 'The best grunge, alternative, and pop hits from the decade that changed music',
                icon: '🎸',
                color: '#ff6b6b',
                trackCount: 5
            },
            '80s_synthwave': {
                id: '80s_synthwave',
                name: '80s Synthwave',
                description: 'Neon-soaked synth beats and electric dreams from the decade of excess',
                icon: '🌈',
                color: '#ff0080',
                trackCount: 4
            },
            'chill_vibes': {
                id: 'chill_vibes',
                name: 'Chill Vibes',
                description: 'Laid-back tracks for studying, relaxing, or just vibing',
                icon: '🌙',
                color: '#4ecdc4',
                trackCount: 3
            },
            'party_bangers': {
                id: 'party_bangers',
                name: 'Party Bangers',
                description: 'High-energy tracks to get the party started and keep it going',
                icon: '🎉',
                color: '#ff6b35',
                trackCount: 3
            },
            'indie_gems': {
                id: 'indie_gems',
                name: 'Indie Gems',
                description: 'Hidden treasures and underground favorites from independent artists',
                icon: '💎',
                color: '#a8e6cf',
                trackCount: 3
            },
            'hip_hop_classics': {
                id: 'hip_hop_classics',
                name: 'Hip-Hop Classics',
                description: 'Essential tracks that defined the culture and shaped the genre',
                icon: '🎤',
                color: '#ffd93d',
                trackCount: 3
            }
        }

        const playlistSongs = {
            '90s_hits': [
            {
                id: '1',
                title: 'Smells Like Teen Spirit',
                artist: 'Nirvana',
                duration: '5:01',
                videoId: 'hTWKbfoikeg',
                thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg',
                addedBy: 'grunge_kid_92',
                userAvatar: '🎸',
                timestamp: '2 min ago',
                comment: 'This song changed everything for me in high school. Peak 90s energy! 🔥',
                likes: 25,
                replies: 8,
                recasts: 12
            },
            {
                id: '2',
                title: 'Loser',
                artist: 'Beck',
                duration: '3:54',
                videoId: 'YgSPaXgAdzE',
                thumbnail: 'https://img.youtube.com/vi/YgSPaXgAdzE/mqdefault.jpg',
                addedBy: 'alt_rock_alice',
                userAvatar: '🎭',
                timestamp: '5 min ago',
                comment: 'Perfect slacker anthem. Beck was so ahead of his time.',
                likes: 20,
                replies: 4,
                recasts: 9
            },
            {
                id: '3',
                title: 'Creep',
                artist: 'Radiohead',
                duration: '3:58',
                videoId: 'XFkzRNyygfk',
                thumbnail: 'https://img.youtube.com/vi/XFkzRNyygfk/mqdefault.jpg',
                addedBy: 'radiohead_stan',
                userAvatar: '👁️',
                timestamp: '8 min ago',
                comment: 'Before OK Computer, there was this masterpiece. Still hits different.',
                likes: 29,
                replies: 12,
                recasts: 15
            },
            {
                id: '4',
                title: 'Black',
                artist: 'Pearl Jam',
                duration: '5:43',
                videoId: 'cs-XZ_dN4Hc',
                thumbnail: 'https://img.youtube.com/vi/cs-XZ_dN4Hc/mqdefault.jpg',
                addedBy: 'seattle_sound',
                userAvatar: '🌧️',
                timestamp: '12 min ago',
                comment: 'Eddie Vedder\'s voice on this track... pure emotion. Seattle forever.',
                likes: 36,
                replies: 11,
                recasts: 18
            },
            {
                id: '5',
                title: 'Zombie',
                artist: 'The Cranberries',
                duration: '5:06',
                videoId: '6Ejga4kJUts',
                thumbnail: 'https://img.youtube.com/vi/6Ejga4kJUts/mqdefault.jpg',
                addedBy: 'irish_dreamer',
                userAvatar: '🍀',
                timestamp: '15 min ago',
                comment: 'Dolores O\'Riordan had such a unique voice. RIP to a legend.',
                likes: 45,
                replies: 14,
                recasts: 22
            },
            {
                id: '6',
                title: 'Under the Bridge',
                artist: 'Red Hot Chili Peppers',
                duration: '4:24',
                videoId: 'lwlogyj7nFE',
                thumbnail: 'https://img.youtube.com/vi/lwlogyj7nFE/mqdefault.jpg',
                addedBy: 'funk_rock_fan',
                userAvatar: '🌶️',
                timestamp: '18 min ago',
                comment: 'LA vibes forever. This song captures the city perfectly.',
                likes: 36,
                replies: 8,
                recasts: 16
            },
            {
                id: '7',
                title: 'Man in the Box',
                artist: 'Alice in Chains',
                duration: '4:46',
                videoId: 'TAqZb52sgpU',
                thumbnail: 'https://img.youtube.com/vi/TAqZb52sgpU/mqdefault.jpg',
                addedBy: 'heavy_metal_mike',
                userAvatar: '⛓️',
                timestamp: '22 min ago',
                comment: 'Layne Staley\'s voice was unmatched. This riff is iconic.',
                likes: 29,
                replies: 6,
                recasts: 13
            },
            {
                id: '8',
                title: 'Touch Me I\'m Sick',
                artist: 'Mudhoney',
                duration: '2:33',
                videoId: 'HD7ClvlL36E',
                thumbnail: 'https://img.youtube.com/vi/HD7ClvlL36E/mqdefault.jpg',
                addedBy: 'underground_hero',
                userAvatar: '🎪',
                timestamp: '25 min ago',
                comment: 'Deep cut from the Seattle scene. Mudhoney doesn\'t get enough love!',
                likes: 25,
                replies: 9,
                recasts: 8
            },
            {
                id: '9',
                title: 'Plush',
                artist: 'Stone Temple Pilots',
                duration: '5:13',
                videoId: 'V5UOC0C0x8Q',
                thumbnail: 'https://img.youtube.com/vi/V5UOC0C0x8Q/mqdefault.jpg',
                addedBy: 'stp_collector',
                userAvatar: '🗿',
                timestamp: '28 min ago',
                comment: 'Scott Weiland was such a showman. This video is pure 90s aesthetic.',
                likes: 27,
                replies: 7,
                recasts: 11
            },
            {
                id: '10',
                title: 'Everlong',
                artist: 'Foo Fighters',
                duration: '4:10',
                videoId: 'eBG7P-K-r1Y',
                thumbnail: 'https://img.youtube.com/vi/eBG7P-K-r1Y/mqdefault.jpg',
                addedBy: 'dave_grohl_fan',
                userAvatar: '🥁',
                timestamp: '32 min ago',
                comment: 'Dave Grohl is a musical genius. From Nirvana to this masterpiece.',
                likes: 45,
                replies: 14,
                recasts: 20
            },
            {
                id: '11',
                title: 'Hunger Strike',
                artist: 'Temple of the Dog',
                duration: '4:03',
                videoId: 'VUb450Alpps',
                thumbnail: 'https://img.youtube.com/vi/VUb450Alpps/mqdefault.jpg',
                addedBy: 'cornell_tribute',
                userAvatar: '🎤',
                timestamp: '35 min ago',
                comment: 'Chris Cornell and Eddie Vedder together. Doesn\'t get better than this.',
                likes: 55,
                replies: 18,
                recasts: 25
            },
            {
                id: '12',
                title: 'Glycerine',
                artist: 'Bush',
                duration: '4:27',
                videoId: 'hOllF3TgAsM',
                thumbnail: 'https://img.youtube.com/vi/hOllF3TgAsM/mqdefault.jpg',
                addedBy: 'brit_grunge_lover',
                userAvatar: '🇬🇧',
                timestamp: '38 min ago',
                comment: 'British grunge was different but equally amazing. Gavin Rossdale had it.',
                likes: 27,
                replies: 7,
                recasts: 11
            },
            {
                id: '13',
                title: 'Spin the Black Circle',
                artist: 'Pearl Jam',
                duration: '2:48',
                videoId: 'HuTBNWkf6Y4',
                thumbnail: 'https://img.youtube.com/vi/HuTBNWkf6Y4/mqdefault.jpg',
                addedBy: 'vinyl_collector',
                userAvatar: '💿',
                timestamp: '42 min ago',
                comment: 'A song about vinyl records! Meta and amazing. Vitalogy era PJ was peak.',
                reactions: { fire: 8, vinyl: 15, nostalgia: 6 }
            },
            {
                id: '14',
                title: 'Sabotage',
                artist: 'Beastie Boys',
                duration: '2:58',
                videoId: 'z5rRZdiu1UE',
                thumbnail: 'https://img.youtube.com/vi/z5rRZdiu1UE/mqdefault.jpg',
                addedBy: 'hip_hop_head',
                userAvatar: '🎯',
                timestamp: '45 min ago',
                comment: 'The 70s cop show video is legendary. Beasties were way ahead of their time.',
                reactions: { fire: 14, cool: 12, retro: 8 }
            },
            {
                id: '15',
                title: 'Killing in the Name',
                artist: 'Rage Against the Machine',
                duration: '5:14',
                videoId: 'bWXazVhlyxQ',
                thumbnail: 'https://img.youtube.com/vi/bWXazVhlyxQ/mqdefault.jpg',
                addedBy: 'rebel_with_cause',
                userAvatar: '✊',
                timestamp: '48 min ago',
                comment: 'Still relevant today. Some things never change. F*** you I won\'t do what you tell me!',
                reactions: { fire: 28, rebel: 22, power: 15 }
            },
            {
                id: '16',
                title: 'Basket Case',
                artist: 'Green Day',
                duration: '3:01',
                videoId: 'NUTGr5t3MoY',
                thumbnail: 'https://img.youtube.com/vi/NUTGr5t3MoY/mqdefault.jpg',
                addedBy: 'punk_princess',
                userAvatar: '💚',
                timestamp: '52 min ago',
                comment: 'Dookie was my introduction to punk. Billie Joe\'s anxiety became our anthem.',
                reactions: { fire: 17, heart: 13, punk: 10 }
            },
            {
                id: '17',
                title: 'Interstate Love Song',
                artist: 'Stone Temple Pilots',
                duration: '3:15',
                videoId: 'yjJL9DGU7Gg',
                thumbnail: 'https://img.youtube.com/vi/yjJL9DGU7Gg/mqdefault.jpg',
                addedBy: 'highway_dreamer',
                userAvatar: '🛣️',
                timestamp: '55 min ago',
                comment: 'Perfect road trip song. The guitar work on this is underrated.',
                reactions: { fire: 10, chill: 14, road: 8 }
            },
            {
                id: '18',
                title: 'Today',
                artist: 'The Smashing Pumpkins',
                duration: '3:20',
                videoId: 'xmUZ6nCFNoU',
                thumbnail: 'https://img.youtube.com/vi/xmUZ6nCFNoU/mqdefault.jpg',
                addedBy: 'billy_corgan_fan',
                userAvatar: '🎃',
                timestamp: '58 min ago',
                comment: 'Today is the greatest day I\'ve ever known... Billy\'s lyrics hit different.',
                reactions: { heart: 19, fire: 12, deep: 9 }
            },
            {
                id: '19',
                title: 'Alive',
                artist: 'Pearl Jam',
                duration: '5:40',
                videoId: 'wGiTPgvKktM',
                thumbnail: 'https://img.youtube.com/vi/wGiTPgvKktM/mqdefault.jpg',
                addedBy: 'ten_album_stan',
                userAvatar: '🔟',
                timestamp: '1 hr ago',
                comment: 'The song that started it all for PJ. That guitar solo still gives me chills.',
                reactions: { fire: 24, heart: 16, classic: 12 }
            },
            {
                id: '20',
                title: 'Touch Me',
                artist: 'The Doors',
                duration: '3:12',
                videoId: '9X5XxnbsEjc',
                thumbnail: 'https://img.youtube.com/vi/9X5XxnbsEjc/mqdefault.jpg',
                addedBy: 'doors_disciple',
                userAvatar: '🚪',
                timestamp: '1 hr ago',
                comment: 'Throwing in some classic rock vibes. Jim Morrison was pure poetry.',
                reactions: { fire: 13, classic: 18, poetry: 7 }
            },
            {
                id: '21',
                title: 'Come As You Are',
                artist: 'Nirvana',
                duration: '3:39',
                videoId: 'vabnZ9-ex7o',
                thumbnail: 'https://img.youtube.com/vi/vabnZ9-ex7o/mqdefault.jpg',
                addedBy: 'VibesCurator',
                userAvatar: '🎵',
                timestamp: '15 min ago',
                comment: 'Classic grunge masterpiece. The guitar riff is absolutely iconic.',
                reactions: { fire: 25, heart: 18, nostalgia: 10 }
            },
            {
                id: '22',
                title: 'Touch Me I\'m Sick',
                artist: 'Mudhoney',
                duration: '2:34',
                videoId: 'jAZ6Lem5RYs',
                thumbnail: 'https://img.youtube.com/vi/jAZ6Lem5RYs/mqdefault.jpg',
                addedBy: 'VibesCurator',
                userAvatar: '🎵',
                timestamp: '20 min ago',
                comment: 'Underground grunge gem! Sub Pop Records at its finest.',
                reactions: { fire: 15, punk: 8, deep: 5 }
            }
            ],
            '80s_synthwave': [
                {
                    id: '23',
                    title: 'Take On Me',
                    artist: 'a-ha',
                    duration: '3:47',
                    videoId: 'djV11Xbc914',
                    thumbnail: 'https://img.youtube.com/vi/djV11Xbc914/mqdefault.jpg',
                    addedBy: 'synth_lover_85',
                    userAvatar: '🎹',
                    timestamp: '10 min ago',
                    comment: 'That music video was mind-blowing! The pencil sketch effect was revolutionary.',
                    likes: 45,
                    replies: 12,
                    recasts: 18
                },
                {
                    id: '24',
                    title: 'Sweet Dreams',
                    artist: 'Eurythmics',
                    duration: '3:36',
                    videoId: 'qeMFqkcPYcg',
                    thumbnail: 'https://img.youtube.com/vi/qeMFqkcPYcg/mqdefault.jpg',
                    addedBy: 'annie_lennox_stan',
                    userAvatar: '👩‍🎤',
                    timestamp: '15 min ago',
                    comment: 'Annie Lennox was so ahead of her time. This song gives me chills every time.',
                    likes: 36,
                    replies: 11,
                    recasts: 16
                },
                {
                    id: '25',
                    title: 'Blue Monday',
                    artist: 'New Order',
                    duration: '7:30',
                    videoId: 'FYH8DsU2WCk',
                    thumbnail: 'https://img.youtube.com/vi/FYH8DsU2WCk/mqdefault.jpg',
                    addedBy: 'new_wave_warrior',
                    userAvatar: '💙',
                    timestamp: '20 min ago',
                    comment: 'This track defined electronic music. Those synths still sound futuristic today.',
                    likes: 46,
                    replies: 13,
                    recasts: 19
                },
                {
                    id: '26',
                    title: 'Don\'t You Forget About Me',
                    artist: 'Simple Minds',
                    duration: '4:20',
                    videoId: 'CdqoNKCCt7A',
                    thumbnail: 'https://img.youtube.com/vi/CdqoNKCCt7A/mqdefault.jpg',
                    addedBy: 'breakfast_club_fan',
                    userAvatar: '🥞',
                    timestamp: '25 min ago',
                    comment: 'The Breakfast Club made this song immortal. Pure 80s perfection!',
                    likes: 46,
                    replies: 16,
                    recasts: 22
                },
                {
                    id: '27',
                    title: 'Flashdance... What A Feeling',
                    artist: 'Irene Cara',
                    duration: '3:56',
                    videoId: 'ILnHzQiMrXk',
                    thumbnail: 'https://img.youtube.com/vi/ILnHzQiMrXk/mqdefault.jpg',
                    addedBy: 'VibesCurator',
                    userAvatar: '🎵',
                    timestamp: '30 min ago',
                    comment: '80s anthem! The energy in this track is absolutely infectious.',
                    reactions: { fire: 20, energy: 15, dance: 12 }
                }
            ],
            'chill_vibes': [
                {
                    id: '31',
                    title: 'Mad World',
                    artist: 'Gary Jules',
                    duration: '3:07',
                    videoId: 'hW93CV6m-JU',
                    thumbnail: 'https://img.youtube.com/vi/hW93CV6m-JU/mqdefault.jpg',
                    addedBy: 'donnie_darko_fan',
                    userAvatar: '🐰',
                    timestamp: '5 min ago',
                    comment: 'This cover is hauntingly beautiful. Perfect for late night contemplation.',
                    reactions: { heart: 24, haunting: 16, beautiful: 12 }
                },
                {
                    id: '32',
                    title: 'Breathe Me',
                    artist: 'Sia',
                    duration: '4:31',
                    videoId: 'ghPcYqn0p4Y',
                    thumbnail: 'https://img.youtube.com/vi/ghPcYqn0p4Y/mqdefault.jpg',
                    addedBy: 'emotional_sia',
                    userAvatar: '😌',
                    timestamp: '12 min ago',
                    comment: 'Before she was hiding her face, Sia was making us cry with pure emotion.',
                    reactions: { heart: 19, emotional: 14, cry: 8 }
                },
                {
                    id: '33',
                    title: 'Skinny Love',
                    artist: 'Bon Iver',
                    duration: '3:58',
                    videoId: 'ssdgFoHLwnk',
                    thumbnail: 'https://img.youtube.com/vi/ssdgFoHLwnk/mqdefault.jpg',
                    addedBy: 'indie_forest',
                    userAvatar: '🌲',
                    timestamp: '20 min ago',
                    comment: 'Recorded in a cabin in the woods. You can feel the isolation and beauty.',
                    reactions: { heart: 17, woods: 13, isolation: 9 }
                }
            ],
            'party_bangers': [
                {
                    id: '41',
                    title: 'Mr. Brightside',
                    artist: 'The Killers',
                    duration: '3:42',
                    videoId: 'gGdGFtwCNBE',
                    thumbnail: 'https://img.youtube.com/vi/gGdGFtwCNBE/mqdefault.jpg',
                    addedBy: 'party_starter',
                    userAvatar: '⚡',
                    timestamp: '3 min ago',
                    comment: 'This song NEVER fails to get everyone singing along. Ultimate party anthem!',
                    reactions: { fire: 25, party: 20, energy: 18 }
                },
                {
                    id: '42',
                    title: 'I Gotta Feeling',
                    artist: 'Black Eyed Peas',
                    duration: '4:49',
                    videoId: 'uSD4vsh1zDA',
                    thumbnail: 'https://img.youtube.com/vi/uSD4vsh1zDA/mqdefault.jpg',
                    addedBy: 'dance_machine',
                    userAvatar: '🕺',
                    timestamp: '8 min ago',
                    comment: 'Tonight\'s gonna be a good night! This song is pure hype energy.',
                    reactions: { fire: 23, dance: 19, hype: 15 }
                },
                {
                    id: '43',
                    title: 'Hey Ya!',
                    artist: 'OutKast',
                    duration: '3:55',
                    videoId: 'PWgvGjAhvIw',
                    thumbnail: 'https://img.youtube.com/vi/PWgvGjAhvIw/mqdefault.jpg',
                    addedBy: 'outkast_forever',
                    userAvatar: '🎤',
                    timestamp: '15 min ago',
                    comment: 'Shake it like a Polaroid picture! Andre 3000 is a genius.',
                    reactions: { fire: 21, genius: 14, shake: 17 }
                }
            ],
            'indie_gems': [
                {
                    id: '51',
                    title: 'Such Great Heights',
                    artist: 'The Postal Service',
                    duration: '4:26',
                    videoId: '0wrsZog8qXg',
                    thumbnail: 'https://img.youtube.com/vi/0wrsZog8qXg/mqdefault.jpg',
                    addedBy: 'indie_explorer',
                    userAvatar: '📮',
                    timestamp: '7 min ago',
                    comment: 'Ben Gibbard\'s voice + electronic beats = perfection. This song is a masterpiece.',
                    reactions: { heart: 18, masterpiece: 12, electronic: 9 }
                },
                {
                    id: '52',
                    title: 'Young Folks',
                    artist: 'Peter Bjorn and John',
                    duration: '4:38',
                    videoId: 'OIRE6iw-ws4',
                    thumbnail: 'https://img.youtube.com/vi/OIRE6iw-ws4/mqdefault.jpg',
                    addedBy: 'whistling_wanderer',
                    userAvatar: '🎵',
                    timestamp: '18 min ago',
                    comment: 'That whistle hook is so catchy! Swedish indie at its finest.',
                    reactions: { fire: 15, catchy: 16, swedish: 7 }
                },
                {
                    id: '53',
                    title: 'Time to Dance',
                    artist: 'The Sounds',
                    duration: '3:12',
                    videoId: 'vkKOx8hJA_k',
                    thumbnail: 'https://img.youtube.com/vi/vkKOx8hJA_k/mqdefault.jpg',
                    addedBy: 'garage_rock_girl',
                    userAvatar: '🎸',
                    timestamp: '25 min ago',
                    comment: 'Swedish garage rock with attitude! Maja Ivarsson is a rock goddess.',
                    reactions: { fire: 13, attitude: 11, goddess: 8 }
                }
            ],
            'hip_hop_classics': [
                {
                    id: '61',
                    title: 'Juicy',
                    artist: 'The Notorious B.I.G.',
                    duration: '5:02',
                    videoId: '_JZom_gVfuw',
                    thumbnail: 'https://img.youtube.com/vi/_JZom_gVfuw/mqdefault.jpg',
                    addedBy: 'biggie_fan_4life',
                    userAvatar: '👑',
                    timestamp: '4 min ago',
                    comment: 'From ashy to classy! Biggie told his story like no one else. RIP to the king.',
                    reactions: { fire: 28, king: 22, rip: 15 }
                },
                {
                    id: '62',
                    title: 'California Love',
                    artist: '2Pac ft. Dr. Dre',
                    duration: '4:16',
                    videoId: '5wBTdfAkqGU',
                    thumbnail: 'https://img.youtube.com/vi/5wBTdfAkqGU/mqdefault.jpg',
                    addedBy: 'west_coast_rider',
                    userAvatar: '☀️',
                    timestamp: '11 min ago',
                    comment: 'West Coast anthem! Pac and Dre together was pure magic.',
                    reactions: { fire: 26, west: 19, magic: 13 }
                },
                {
                    id: '63',
                    title: 'Lose Yourself',
                    artist: 'Eminem',
                    duration: '5:26',
                    videoId: '_Yhyp-_hX2s',
                    thumbnail: 'https://img.youtube.com/vi/_Yhyp-_hX2s/mqdefault.jpg',
                    addedBy: 'slim_shady_stan',
                    userAvatar: '🎬',
                    timestamp: '19 min ago',
                    comment: 'You only get one shot! This song is pure motivation and lyrical genius.',
                    reactions: { fire: 24, motivation: 20, genius: 16 }
                }
            ]
        }

        let currentPlaylistId = '90s_hits'
        let songs = playlistSongs[currentPlaylistId]
        let currentSongId = '1'
        let isPlaying = false
        let isSearching = false
        let autoAdvanceEnabled = true
        let isViewingReplies = false
        let currentReplyThreadId = null
        let currentSortOrder = 'recent'

        function updateTime() {
            const now = new Date()
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
            document.getElementById('taskbar-time').textContent = timeStr
        }

        function toggleThemeSelector() {
            const selector = document.getElementById('theme-selector')
            selector.classList.toggle('hidden')
        }

        function updateTime() {
            const now = new Date()
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
            document.getElementById('current-time').textContent = timeStr
        }

        function getCurrentSong() {
            return songs.find(s => s.id === currentSongId)
        }

        function renderPlaylist() {
            const container = document.getElementById('playlist-container')
            const trackCount = document.getElementById('track-count')
            const totalTime = document.getElementById('total-time')
            
            trackCount.textContent = songs.length
            
            // Calculate total time (simplified)
            const totalMinutes = songs.reduce((acc, song) => {
                const [min, sec] = song.duration.split(':').map(Number)
                return acc + min + (sec / 60)
            }, 0)
            const hours = Math.floor(totalMinutes / 60)
            const minutes = Math.floor(totalMinutes % 60)
            totalTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`
            
            container.innerHTML = songs.map((song, index) => `
                <div 
                    class="border-b border-gray-300 p-4 hover:bg-gray-100 cursor-pointer ${song.id === currentSongId ? 'bg-blue-100 border-blue-400' : ''}"
                    onclick="playSong('${song.id}')"
                >
                    <!-- User info header -->
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-lg">${song.userAvatar}</span>
                        <span class="font-bold text-base font-terminal text-black hover:text-blue-600 cursor-pointer" onclick="event.stopPropagation(); showUserProfile('${song.addedBy}')">${song.addedBy}</span>
                        <span class="text-sm text-gray-500">• ${song.timestamp}</span>
                    </div>
                    
                    <!-- Song info -->
                    <div class="flex items-center gap-3 mb-3">
                        <div class="text-sm font-bold text-gray-600 min-w-[2rem]">#${index + 1}</div>
                        <img src="${song.thumbnail}" alt="${song.title}" class="w-12 h-9 object-cover border border-gray-400 rounded">
                        <div class="flex-1">
                            <div class="font-bold text-base font-terminal text-black ${song.id === currentSongId ? 'text-blue-600' : ''}">${song.title}</div>
                            <div class="text-sm text-gray-600 mt-1">${song.artist} • ${song.duration}</div>
                        </div>
                    </div>
                    
                    <!-- User comment -->
                    <div class="text-sm text-gray-700 mb-3 font-terminal italic leading-relaxed">
                        ${song.comment}
                    </div>
                    
                    <!-- Reactions -->
                    <div class="flex items-center gap-4 text-sm">
                        <span class="flex items-center gap-1 text-gray-500 hover:text-blue-600 cursor-pointer">
                            👍 ${song.likes || Math.floor(Math.random() * 30) + 5}
                        </span>
                        <span class="flex items-center gap-1 text-gray-500 hover:text-blue-600 cursor-pointer">
                            🔄 ${song.recasts || Math.floor(Math.random() * 15) + 2}
                        </span>
                        <span class="flex items-center gap-1 text-gray-500 hover:text-blue-600 cursor-pointer" onclick="showReplies('${song.id}'); event.stopPropagation()">
                            💬 ${song.replies || Math.floor(Math.random() * 10) + 1} ${(song.replies || Math.floor(Math.random() * 10) + 1) === 1 ? 'reply' : 'replies'}
                        </span>
                    </div>
                </div>
            `).join('')
        }

        function getReactionEmoji(reaction) {
            const emojis = {
                fire: '🔥',
                heart: '❤️', 
                cool: '😎',
                nostalgia: '🌅',
                melancholy: '😢',
                respect: '🙏',
                chill: '😌',
                metal: '🤘',
                underground: '🎪',
                aesthetic: '✨',
                rock: '🎸',
                classic: '👑',
                rebel: '✊',
                power: '💪',
                punk: '🔥',
                road: '🛣️',
                deep: '🤔',
                vinyl: '💿',
                retro: '📺',
                poetry: '📝'
            }
            return emojis[reaction] || '👍'
        }

        function updatePlayer() {
            const videoContainer = document.getElementById('video-container')
            const nowPlayingLCD = document.getElementById('now-playing-lcd')
            const song = getCurrentSong()

            if (song && isPlaying) {
                videoContainer.innerHTML = `
                    <div id="youtube-player" style="height: 400px; width: 100%;"></div>
                `
                
                // Set up YouTube player with API
                setTimeout(() => setupYouTubePlayer(), 100)
                nowPlayingLCD.innerHTML = `
                    <div class="animate-blink">♪</div>
                    ${song.title.toUpperCase()} - ${song.artist.toUpperCase()}
                `
            } else if (song) {
                videoContainer.innerHTML = `
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="text-center">
                            <img src="${song.thumbnail}" alt="${song.title}" class="w-32 h-24 object-cover border-4 border-grunge-yellow mx-auto mb-4">
                            <p class="font-impact text-xl text-grunge-magenta">${song.title}</p>
                            <p class="text-sm font-terminal text-grunge-cyan">${song.artist}</p>
                        </div>
                    </div>
                `
                nowPlayingLCD.textContent = `PAUSED - ${song.title.toUpperCase()}`
            } else {
                videoContainer.innerHTML = `
                    <div class="absolute inset-0 flex items-center justify-center text-grunge-lime">
                        <div class="text-center animate-bounce-in">
                            <div class="cd-shimmer w-24 h-24 rounded-full border-4 border-gray-400 mx-auto mb-4 flex items-center justify-center">
                                <div class="w-8 h-8 bg-black rounded-full"></div>
                            </div>
                            <p class="font-impact text-xl text-grunge-yellow">NO DISC INSERTED</p>
                            <p class="text-sm font-terminal text-grunge-cyan mt-2">Select a track to begin playback</p>
                        </div>
                    </div>
                `
                nowPlayingLCD.textContent = 'READY - INSERT DISC TO PLAY'
            }
        }

        // YouTube API variables
        let youtubePlayer = null
        let isYouTubeAPIReady = false
        
        // YouTube API ready callback (called automatically by YouTube API)
        window.onYouTubeIframeAPIReady = function() {
            console.log('YouTube iframe API ready')
            isYouTubeAPIReady = true
        }
        
        function setupYouTubePlayer() {
            if (!autoAdvanceEnabled || !isYouTubeAPIReady) return
            
            const song = getCurrentSong()
            if (!song) return
            
            console.log('Setting up YouTube player with API for:', song.title)
            
            // Destroy existing player if any
            if (youtubePlayer) {
                youtubePlayer.destroy()
            }
            
            // Create new player
            youtubePlayer = new YT.Player('youtube-player', {
                height: '400',
                width: '100%',
                videoId: song.videoId,
                playerVars: {
                    autoplay: isPlaying ? 1 : 0,
                    rel: 0,
                    modestbranding: 1,
                    enablejsapi: 1
                },
                events: {
                    onStateChange: onPlayerStateChange
                }
            })
        }
        
        function onPlayerStateChange(event) {
            console.log('YouTube player state changed:', event.data)
            
            switch(event.data) {
                case YT.PlayerState.ENDED:
                    console.log('Video ended - auto advancing')
                    if (autoAdvanceEnabled) {
                        autoAdvanceToNext()
                    }
                    break
                case YT.PlayerState.PLAYING:
                    console.log('Video playing')
                    break
                case YT.PlayerState.PAUSED:
                    console.log('Video paused')
                    break
            }
        }

        function autoAdvanceToNext() {
            console.log('autoAdvanceToNext called')
            const currentIndex = songs.findIndex(s => s.id === currentSongId)
            console.log(`Current song index: ${currentIndex}, total songs: ${songs.length}`)
            
            if (currentIndex < songs.length - 1) {
                // Play next song in playlist
                const nextSong = songs[currentIndex + 1]
                console.log(`Advancing to next song: ${nextSong.title}`)
                playSong(nextSong.id)
                showNotification(`Auto-playing: ${nextSong.title}`, 'info')
            } else {
                // End of playlist - could loop back to first song or stop
                console.log('Reached end of playlist, looping to first song')
                const firstSong = songs[0]
                playSong(firstSong.id)
                showNotification(`Playlist complete! Restarting with: ${firstSong.title}`, 'info')
            }
        }


        

        async function searchYouTube() {
            const query = document.getElementById('search-input').value.trim()
            const searchBtn = document.getElementById('search-btn')
            const resultsContainer = document.getElementById('search-results')
            
            if (!query || isSearching) return
            
            isSearching = true
            searchBtn.textContent = 'SEARCHING...'
            searchBtn.disabled = true
            
            resultsContainer.innerHTML = `
                <div class="text-center py-8 animate-pulse">
                    <i class="fas fa-search text-4xl mb-4 animate-spin opacity-50"></i><br>
                    Searching music database...
                </div>
            `

            // Mock results for demo
            setTimeout(() => {
                const mockResults = [
                    {
                        videoId: 'dQw4w9WgXcQ',
                        title: `${query} - Official Music Video`,
                        artist: 'Various Artists',
                        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
                    },
                    {
                        videoId: 'kJQP7kiw5Fk',
                        title: `${query} - Live Performance`,
                        artist: 'Live Archive',
                        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg'
                    }
                ]
                displaySearchResults(mockResults)
            }, 1000)
            
            isSearching = false
            searchBtn.textContent = 'SEARCH DATABASE'
            searchBtn.disabled = false
        }

        function displaySearchResults(results) {
            const resultsContainer = document.getElementById('search-results')
            
            resultsContainer.innerHTML = results.map(result => `
                <div 
                    class="flex items-center p-2 hover:bg-blue-200 cursor-pointer border-b border-gray-300"
                    onclick="addSongFromSearch('${result.videoId}', '${result.title.replace(/'/g, "\\'")}', '${result.artist.replace(/'/g, "\\'")}')"
                >
                    <img 
                        src="${result.thumbnail}" 
                        alt="${result.title}"
                        class="w-16 h-12 object-cover border border-gray-400 mr-3"
                    />
                    <div class="flex-1">
                        <div class="font-bold text-base font-terminal text-black">${result.title}</div>
                        <div class="text-sm text-gray-600">${result.artist}</div>
                        ${result.description ? `<div class="text-sm text-gray-500 mt-1">${result.description.substring(0, 60)}...</div>` : ''}
                    </div>
                    <div class="win95-button px-3 py-2 text-base font-bold text-black">
                        ADD
                    </div>
                </div>
            `).join('')
        }

        function addSongFromSearch(videoId, title, artist) {
            const userComment = document.getElementById('comment-input').value.trim() || getRandomComment()
            const usernames = ['music_lover_95', 'grunge_enthusiast', 'vinyl_digger', 'indie_explorer', 'rock_collector', 'beat_hunter']
            const avatars = ['🎵', '🎸', '🎤', '🥁', '🎹', '🎺', '🎻', '🎶', '🔥', '⭐']
            
            const newSong = {
                id: Date.now().toString(),
                title: title.length > 50 ? title.substring(0, 47) + '...' : title,
                artist: artist.length > 30 ? artist.substring(0, 27) + '...' : artist,
                duration: '0:00',
                videoId: videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                addedBy: usernames[Math.floor(Math.random() * usernames.length)],
                userAvatar: avatars[Math.floor(Math.random() * avatars.length)],
                timestamp: 'just now',
                comment: userComment,
                reactions: generateRandomReactions()
            }
            
            songs.unshift(newSong) // Add to top of feed
            renderPlaylist()
            hideAddModal()
            showNotification('Track added to social feed!')
        }

        function getRandomComment() {
            const comments = [
                'This track hits different! 🔥',
                'Found this gem and had to share it',
                'Perfect vibes for today',
                'This song never gets old',
                'Adding some fire to the playlist',
                'Such an underrated track',
                'This brings back memories',
                'Discovered this and obsessed!',
                'Peak music right here',
                'Adding some variety to the mix'
            ]
            return comments[Math.floor(Math.random() * comments.length)]
        }

        function generateRandomReactions() {
            return {
                likes: Math.floor(Math.random() * 30) + 5,
                recasts: Math.floor(Math.random() * 15) + 2,
                replies: Math.floor(Math.random() * 10) + 1
            }
        }

        function showNotification(message) {
            // Create Windows 95 style notification
            const notification = document.createElement('div')
            notification.className = 'fixed top-4 right-4 win95-panel p-3 z-50 animate-slide-in'
            notification.innerHTML = `
                <div class="windows-titlebar p-1 mb-2">
                    <i class="fas fa-info-circle mr-2"></i>Vibes 95
                </div>
                <div class="text-black font-terminal text-sm">${message}</div>
            `
            
            document.body.appendChild(notification)
            
            setTimeout(() => {
                notification.style.animation = 'glitch-90s 0.3s ease-in-out'
                setTimeout(() => notification.remove(), 300)
            }, 3000)
        }

        function updatePlayButton() {
            const playBtn = document.getElementById('play-btn')
            playBtn.innerHTML = `<i class="fas fa-${isPlaying ? 'pause' : 'play'}"></i>`
        }

        function playSong(id) {
            currentSongId = id
            isPlaying = true
            updatePlayer()
            updatePlayButton()
            renderPlaylist()
        }

        function togglePlay() {
            if (!currentSongId && songs.length > 0) {
                playSong(songs[0].id)
            } else {
                isPlaying = !isPlaying
                
                // Control YouTube player directly
                if (youtubePlayer) {
                    if (isPlaying) {
                        youtubePlayer.playVideo()
                    } else {
                        youtubePlayer.pauseVideo()
                    }
                }
                
                updatePlayer()
                updatePlayButton()
            }
        }

        function playNext() {
            const currentIndex = songs.findIndex(s => s.id === currentSongId)
            const nextIndex = (currentIndex + 1) % songs.length
            if (songs[nextIndex]) {
                playSong(songs[nextIndex].id)
            }
        }

        function playPrevious() {
            const currentIndex = songs.findIndex(s => s.id === currentSongId)
            const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
            if (songs[prevIndex]) {
                playSong(songs[prevIndex].id)
            }
        }

        function shufflePlaylist() {
            songs = songs.sort(() => Math.random() - 0.5)
            currentSortOrder = 'random'
            updateSortButtons()
            renderPlaylist()
            showNotification('Mixtape shuffled!')
        }

        function sortPlaylist(sortType) {
            currentSortOrder = sortType
            
            switch(sortType) {
                case 'recent':
                    // Sort by timestamp (most recent first)
                    songs = songs.sort((a, b) => {
                        const timeA = parseTimestamp(a.timestamp)
                        const timeB = parseTimestamp(b.timestamp)
                        return timeA - timeB // Most recent first
                    })
                    break
                    
                case 'likes':
                    // Sort by likes (highest first)
                    songs = songs.sort((a, b) => (b.likes || 0) - (a.likes || 0))
                    break
                    
                case 'replies':
                    // Sort by replies (highest first)
                    songs = songs.sort((a, b) => (b.replies || 0) - (a.replies || 0))
                    break
            }
            
            updateSortButtons()
            renderPlaylist()
            showNotification(`Sorted by ${sortType}!`)
        }

        function parseTimestamp(timestamp) {
            // Convert timestamp to minutes for sorting
            if (timestamp.includes('just now')) return 0
            if (timestamp.includes('min ago')) return parseInt(timestamp)
            if (timestamp.includes('hr ago')) return parseInt(timestamp) * 60
            return 9999 // Default for older timestamps
        }

        function updateSortButtons() {
            // Reset all buttons
            document.querySelectorAll('[id^="sort-"]').forEach(btn => {
                btn.className = 'win95-button px-2 py-1 text-xs text-black'
            })
            
            // Highlight active button
            const activeBtn = document.getElementById(`sort-${currentSortOrder}`)
            if (activeBtn) {
                activeBtn.className = 'win95-button px-2 py-1 text-xs text-white bg-blue-600'
            }
        }

        function clearPlaylist() {
            if (confirm('Clear all tracks from mixtape?')) {
                songs = []
                currentSongId = null
                isPlaying = false
                renderPlaylist()
                updatePlayer()
                updatePlayButton()
                showNotification('Mixtape cleared!')
            }
        }

        function stopPlayback() {
            isPlaying = false
            currentSongId = null
            updatePlayer()
            updatePlayButton()
            renderPlaylist()
        }

        function removeSong(id) {
            songs = songs.filter(s => s.id !== id)
            if (currentSongId === id) {
                currentSongId = songs.length > 0 ? songs[0].id : null
                if (!currentSongId) isPlaying = false
                updatePlayer()
                updatePlayButton()
            }
            renderPlaylist()
        }

        // Reply Thread Functions
        function generateMockReplies(songId) {
            const song = songs.find(s => s.id === songId)
            if (!song) return []
            
            const replyTemplates = [
                { user: 'music_nerd_99', avatar: '🤓', text: 'This song never gets old! Been listening since day one.' },
                { user: 'vinyl_collector', avatar: '💿', text: 'I have the original pressing on vinyl. Sounds even better analog!' },
                { user: 'genre_police', avatar: '👮', text: 'Actually, this is more post-grunge than pure grunge...' },
                { user: 'nostalgic_soul', avatar: '🌅', text: 'Takes me back to high school. Those were the days!' },
                { user: 'bass_player_87', avatar: '🎸', text: 'That bass line though... *chef\'s kiss*' },
                { user: 'concert_junkie', avatar: '🎤', text: 'Saw them live in \'95. Best show of my life!' },
                { user: 'indie_kid_2000', avatar: '🎧', text: 'Their B-sides are even better than the singles IMO' },
                { user: 'music_historian', avatar: '📚', text: 'Fun fact: This was recorded in just 3 takes!' }
            ]
            
            const numReplies = Math.min(song.replies || 3, replyTemplates.length)
            const shuffled = replyTemplates.sort(() => Math.random() - 0.5)
            
            return shuffled.slice(0, numReplies).map((reply, index) => ({
                ...reply,
                timestamp: `${Math.floor(Math.random() * 59) + 1} min ago`,
                likes: Math.floor(Math.random() * 15) + 1
            }))
        }

        function showReplies(songId) {
            const song = songs.find(s => s.id === songId)
            if (!song) return
            
            isViewingReplies = true
            currentReplyThreadId = songId
            
            const container = document.getElementById('playlist-container')
            const replies = generateMockReplies(songId)
            
            container.innerHTML = `
                <!-- Reply Thread Header -->
                <div class="windows-titlebar p-2 mb-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button onclick="closeReplies()" class="win95-button px-3 py-2 text-base">
                            ← Back
                        </button>
                        <span class="text-white font-bold">Reply Thread</span>
                    </div>
                    <button onclick="closeReplies()" class="text-white hover:bg-blue-700 px-2 py-1 rounded">
                        ✕
                    </button>
                </div>
                
                <!-- Original Post -->
                <div class="border-b border-gray-300 p-4 bg-gray-50">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-lg">${song.userAvatar}</span>
                        <span class="font-bold text-base font-terminal text-black">${song.addedBy}</span>
                        <span class="text-sm text-gray-500">• ${song.timestamp}</span>
                    </div>
                    
                    <div class="flex items-center gap-3 mb-3">
                        <img src="${song.thumbnail}" alt="${song.title}" class="w-12 h-9 object-cover border border-gray-400 rounded">
                        <div>
                            <div class="font-bold text-base font-terminal text-black">${song.title}</div>
                            <div class="text-sm text-gray-600">${song.artist}</div>
                        </div>
                    </div>
                    
                    <div class="text-sm text-gray-700 mb-3 font-terminal italic leading-relaxed">
                        ${song.comment}
                    </div>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span>👍 ${song.likes || 0}</span>
                        <span>🔄 ${song.recasts || 0}</span>
                        <span class="text-blue-600">💬 ${replies.length} replies</span>
                    </div>
                </div>
                
                <!-- Reply Input -->
                <div class="border-b border-gray-300 p-4">
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Write a reply..." 
                            class="flex-1 p-2 text-sm font-terminal border-2 border-gray-400"
                            onkeypress="if(event.key === 'Enter') addReply('${songId}')"
                            id="reply-input"
                        >
                        <button onclick="addReply('${songId}')" class="win95-button px-4 py-2 text-base">
                            Reply
                        </button>
                    </div>
                </div>
                
                <!-- Replies -->
                <div id="replies-container">
                    ${replies.map(reply => `
                        <div class="border-b border-gray-300 p-4 hover:bg-gray-50">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm">${reply.avatar}</span>
                                <span class="font-bold text-sm font-terminal text-black">${reply.user}</span>
                                <span class="text-sm text-gray-500">• ${reply.timestamp}</span>
                            </div>
                            <div class="text-sm text-gray-700 mb-2 font-terminal pl-6">
                                ${reply.text}
                            </div>
                            <div class="pl-6 text-sm text-gray-500">
                                <span class="hover:text-blue-600 cursor-pointer">👍 ${reply.likes}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `
            
            // Focus reply input
            setTimeout(() => {
                const input = document.getElementById('reply-input')
                if (input) input.focus()
            }, 100)
        }

        function closeReplies() {
            isViewingReplies = false
            currentReplyThreadId = null
            renderPlaylist()
        }

        function addReply(songId) {
            const input = document.getElementById('reply-input')
            const text = input.value.trim()
            if (!text) return
            
            const repliesContainer = document.getElementById('replies-container')
            const newReply = `
                <div class="border-b border-gray-300 p-4 hover:bg-gray-50 animate-slide-in">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm">😎</span>
                        <span class="font-bold text-sm font-terminal text-black">You</span>
                        <span class="text-sm text-gray-500">• just now</span>
                    </div>
                    <div class="text-sm text-gray-700 mb-2 font-terminal pl-6">
                        ${text}
                    </div>
                    <div class="pl-6 text-sm text-gray-500">
                        <span class="hover:text-blue-600 cursor-pointer">👍 0</span>
                    </div>
                </div>
            `
            
            repliesContainer.insertAdjacentHTML('afterbegin', newReply)
            input.value = ''
            
            // Update reply count
            const song = songs.find(s => s.id === songId)
            if (song) {
                song.replies = (song.replies || 0) + 1
            }
        }

        function showAddModal() {
            document.getElementById('add-modal').style.display = 'flex'
            setTimeout(() => document.getElementById('search-input').focus(), 100)
        }

        // Playlist Selection Functions
        function showPlaylistSelector() {
            renderPlaylistOptions()
            document.getElementById('playlist-modal').style.display = 'flex'
        }

        function hidePlaylistSelector() {
            document.getElementById('playlist-modal').style.display = 'none'
        }

        function renderPlaylistOptions() {
            const container = document.getElementById('playlist-options')
            
            container.innerHTML = Object.values(playlists).map(playlist => `
                <div 
                    class="flex items-center p-3 hover:bg-blue-200 cursor-pointer border-b border-gray-300 ${playlist.id === currentPlaylistId ? 'bg-blue-600 text-white' : 'text-black'}"
                    onclick="switchPlaylist('${playlist.id}')"
                >
                    <div class="text-2xl mr-4">${playlist.icon}</div>
                    <div class="flex-1">
                        <div class="font-bold text-sm font-terminal">${playlist.name}</div>
                        <div class="text-sm opacity-75 mt-1">${playlist.description}</div>
                        <div class="text-sm mt-1 opacity-60">${playlist.trackCount} tracks</div>
                    </div>
                    <div class="w-4 h-4 rounded-full" style="background-color: ${playlist.color}"></div>
                    ${playlist.id === currentPlaylistId ? '<div class="ml-2 text-sm">✓</div>' : ''}
                </div>
            `).join('')
        }


        function switchPlaylist(playlistId) {
            if (playlistId === currentPlaylistId) {
                hidePlaylistSelector()
                return
            }
            
            console.log(`Switching to playlist: ${playlistId}`)
            
            currentPlaylistId = playlistId
            songs = playlistSongs[currentPlaylistId]
            
            // Reset current song to first song of new playlist
            currentSongId = songs.length > 0 ? songs[0].id : null
            isPlaying = false
            
            // Force UI update with multiple attempts to ensure elements are available
            const updateUI = () => {
                console.log('Updating UI elements...', playlists[currentPlaylistId].name)
                
                const nameElement = document.getElementById('current-playlist-name')
                if (nameElement) {
                    nameElement.textContent = playlists[currentPlaylistId].name
                    nameElement.innerHTML = playlists[currentPlaylistId].name
                    console.log('Updated current-playlist-name')
                }
                
                const nameFeedElement = document.getElementById('current-playlist-name-feed')
                if (nameFeedElement) {
                    nameFeedElement.textContent = playlists[currentPlaylistId].name
                    nameFeedElement.innerHTML = playlists[currentPlaylistId].name
                    // Force a style update
                    nameFeedElement.style.display = 'none'
                    setTimeout(() => {
                        nameFeedElement.style.display = 'inline'
                    }, 1)
                    console.log('Updated current-playlist-name-feed to:', playlists[currentPlaylistId].name)
                }
                
                const displayElement = document.getElementById('current-playlist-display')
                if (displayElement) {
                    displayElement.textContent = playlists[currentPlaylistId].name
                    displayElement.innerHTML = playlists[currentPlaylistId].name
                    console.log('Updated current-playlist-display')
                }
                
                const descElement = document.getElementById('current-playlist-desc')
                if (descElement) {
                    descElement.textContent = playlists[currentPlaylistId].description
                    descElement.innerHTML = playlists[currentPlaylistId].description
                    console.log('Updated current-playlist-desc')
                }
                
                const iconElement = document.getElementById('current-playlist-icon')
                if (iconElement) {
                    iconElement.textContent = playlists[currentPlaylistId].icon
                    iconElement.innerHTML = playlists[currentPlaylistId].icon
                    console.log('Updated current-playlist-icon')
                }
                
                const colorElement = document.getElementById('current-playlist-color')
                if (colorElement) {
                    colorElement.style.backgroundColor = playlists[currentPlaylistId].color
                    console.log('Updated current-playlist-color')
                }
                
                // Force a complete DOM refresh
                const allElements = document.querySelectorAll('#current-playlist-name-feed')
                console.log('Found elements with current-playlist-name-feed:', allElements.length)
                allElements.forEach((el, index) => {
                    console.log(`Element ${index}:`, el.textContent, '-> updating to:', playlists[currentPlaylistId].name)
                    el.textContent = playlists[currentPlaylistId].name
                    el.innerHTML = playlists[currentPlaylistId].name
                })
            }
            
            // Try updating immediately
            updateUI()
            
            // Try again after a short delay to ensure DOM is ready
            setTimeout(updateUI, 50)
            
            updatePlayer()
            updatePlayButton()
            renderPlaylist()
            
            hidePlaylistSelector()
            showNotification(`Switched to ${playlists[currentPlaylistId].name}!`, 'success')
        }

        function hideAddModal() {
            document.getElementById('add-modal').style.display = 'none'
            document.getElementById('search-input').value = ''
            document.getElementById('comment-input').value = ''
            document.getElementById('search-results').innerHTML = `
                <div class="text-center text-gray-500 py-8 font-terminal">
                    <i class="fas fa-compact-disc text-4xl mb-4 text-gray-400"></i><br>
                    Enter search terms to find music tracks
                </div>
            `
        }

        // AI Agent Functions
        function toggleAIAgent() {
            const aiPanel = document.getElementById('ai-panel')
            const toggleBtn = document.getElementById('ai-toggle-btn')
            
            if (aiPanel.style.display === 'none') {
                aiPanel.style.display = 'block'
                aiPanel.style.animation = 'slide-in 0.3s ease-out'
                toggleBtn.innerHTML = '<i class="fas fa-robot mr-1"></i>🤖 Hide DJ Bot'
            } else {
                aiPanel.style.display = 'none'
                toggleBtn.innerHTML = '<i class="fas fa-robot mr-1"></i>🤖 DJ Bot'
            }
        }

        function sendAIMessage() {
            const input = document.getElementById('ai-input')
            const message = input.value.trim()
            if (!message) return

            // Add user message
            addChatMessage('user', message)
            input.value = ''

            // Simulate AI thinking
            setTimeout(() => {
                const response = generateAIResponse(message)
                addChatMessage('ai', response)
            }, 1000 + Math.random() * 1000)
        }

        function aiQuickAction(action) {
            const responses = {
                recommend: "Based on your grunge playlist, I'd suggest adding some Soundgarden, Mad Season, or early Foo Fighters! Want me to find specific tracks?",
                analyze: "Your playlist is 90% grunge/alternative with strong Seattle influence. You have great variety from Nirvana to Temple of the Dog. The energy flow is excellent!",
                trivia: "Fun fact: Did you know 'Smells Like Teen Spirit' was inspired by deodorant? Kurt Cobain didn't realize 'Teen Spirit' was a brand name!",
                mood: "I'm detecting some serious angst and rebellion in your playlist! Perfect for late-night coding or rainy day vibes. Want me to add some matching tracks?"
            }
            addChatMessage('ai', responses[action])
        }

        function addChatMessage(sender, message) {
            const chatContent = document.getElementById('chat-content')
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false, hour: '2-digit', minute: '2-digit' 
            })

            const messageElement = document.createElement('div')
            messageElement.className = 'flex gap-2'
            
            if (sender === 'ai') {
                messageElement.innerHTML = `
                    <div class="text-lg">🤖</div>
                    <div class="flex-1">
                        <div class="bg-gray-200 rounded p-2 text-sm font-terminal">
                            <strong>DJ Bot 95:</strong> ${message}
                        </div>
                        <div class="text-sm text-gray-500 mt-1">${timestamp}</div>
                    </div>
                `
            } else {
                messageElement.innerHTML = `
                    <div class="flex-1 flex justify-end">
                        <div>
                            <div class="bg-blue-500 text-white rounded p-2 text-sm font-terminal">
                                ${message}
                            </div>
                            <div class="text-sm text-gray-500 mt-1 text-right">${timestamp}</div>
                        </div>
                    </div>
                    <div class="text-lg">👤</div>
                `
            }

            chatContent.appendChild(messageElement)
            
            // Scroll to bottom
            const chatMessages = document.getElementById('chat-messages')
            chatMessages.scrollTop = chatMessages.scrollHeight
        }

        function generateAIResponse(userMessage) {
            const responses = [
                `Interesting! I can hear that ${userMessage.toLowerCase()} vibe in your playlist. The 90s were such an amazing time for music discovery!`,
                `Great question about ${userMessage}! As a music AI from 1995, I've got tons of recommendations. What genre are you feeling?`,
                `I love talking about ${userMessage}! Your current playlist has some real gems. Want me to suggest similar artists?`,
                `${userMessage} reminds me of the underground scene back in '95. Those were the days of discovering music through word of mouth!`,
                `Nice topic! ${userMessage} connects well with your grunge collection. I'm processing some perfect recommendations...`
            ]
            return responses[Math.floor(Math.random() * responses.length)]
        }

        // Simple Router
        function initRouter() {
            // Handle navigation
            function navigateTo(page) {
                // Hide all pages
                document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none')
                
                // Show selected page
                const pageElement = document.getElementById(page + '-page')
                if (pageElement) {
                    pageElement.style.display = page === 'home' ? 'flex' : 'block'
                }
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('bg-blue-600', 'text-white')
                    if (link.dataset.page === page) {
                        link.classList.add('bg-blue-600', 'text-white')
                    }
                })
                
                // Update URL
                window.location.hash = page
                
                // Show/hide playlist header (only show on home page)
                const playlistHeader = document.getElementById('playlist-header')
                if (playlistHeader) {
                    playlistHeader.style.display = page === 'home' ? 'block' : 'none'
                }
                
                // Load page-specific content
                if (page === 'discover') {
                    loadDiscoverPage()
                } else if (page === 'trending') {
                    loadTrendingPage()
                } else if (page === 'profile') {
                    loadProfilePage()
                }
            }
            
            // Handle hash changes
            window.addEventListener('hashchange', () => {
                const page = window.location.hash.slice(1) || 'home'
                navigateTo(page)
            })
            
            // Handle nav clicks
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault()
                    const page = link.dataset.page
                    
                    // Reset profile user when clicking Profile tab directly
                    if (page === 'profile') {
                        currentProfileUser = null
                    }
                    
                    navigateTo(page)
                })
            })
            
            // Navigate to initial page
            const initialPage = window.location.hash.slice(1) || 'home'
            navigateTo(initialPage)
        }
        
        // Load Discover Page content
        function loadDiscoverPage() {
            const recommendations = [
                { title: "Black Hole Sun", artist: "Soundgarden", videoId: "3mbBbFH9fAg" },
                { title: "Interstate Love Song", artist: "Stone Temple Pilots", videoId: "yjJL9DGU7Gg" },
                { title: "Plush", artist: "Stone Temple Pilots", videoId: "tXhmwMdUKfA" },
                { title: "Man in the Box", artist: "Alice in Chains", videoId: "TAqZb52sgpU" }
            ]
            
            const container = document.getElementById('discover-recommendations')
            container.innerHTML = recommendations.map(song => `
                <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onclick="addTrackFromRecommendation('${song.title}', '${song.artist}', '${song.videoId}')">
                    <div class="flex items-center gap-3">
                        <img src="https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg" 
                             class="w-20 h-15 object-cover rounded" />
                        <div>
                            <h4 class="font-bold text-black">${song.title}</h4>
                            <p class="text-sm text-gray-600">${song.artist}</p>
                        </div>
                        <button class="ml-auto win95-button px-3 py-1 text-sm">
                            <i class="fas fa-play mr-1"></i>Play
                        </button>
                    </div>
                </div>
            `).join('')
        }
        
        // Trending data
        const trendingData = {
            playlists: [
                { 
                    rank: 1, 
                    name: "90s Hits", 
                    icon: "🎸", 
                    change: "up", 
 
                    description: "The best grunge, alternative, and pop hits from the decade that changed music",
                    color: "#ff6b6b",
                    id: "90s_hits"
                },
                { 
                    rank: 2, 
                    name: "80s Synthwave", 
                    icon: "🌈", 
                    change: "same", 
                    description: "Neon-soaked synthesizer dreams and retro-futuristic beats",
                    color: "#4ecdc4",
                    id: "80s_synthwave"
                },
                { 
                    rank: 3, 
                    name: "Chill Vibes", 
                    icon: "🌙", 
                    change: "up", 
                    description: "Mellow tracks for relaxation and late-night contemplation",
                    color: "#45b7d1",
                    id: "chill_vibes"
                },
                { 
                    rank: 4, 
                    name: "Party Bangers", 
                    icon: "🎉", 
                    change: "down", 
                    description: "High-energy anthems that get the crowd moving",
                    color: "#f39c12",
                    id: "party_bangers"
                },
                { 
                    rank: 5, 
                    name: "Indie Gems", 
                    icon: "💎", 
                    change: "up", 
                    description: "Hidden treasures from independent artists and underground scenes",
                    color: "#9b59b6",
                    id: "indie_gems"
                }
            ],
            songs: [
                {
                    rank: 1,
                    title: "Smells Like Teen Spirit",
                    artist: "Nirvana",
                    change: "up",
                    videoId: "hTWKbfoikeg",
                    addedBy: "grunge_kid_92",
                    timestamp: "2 hours ago"
                },
                {
                    rank: 2,
                    title: "Blue Monday", 
                    artist: "New Order",
                    change: "same",
                    videoId: "FYH8DsU2WCk",
                    addedBy: "synth_lover_85",
                    timestamp: "5 hours ago"
                },
                {
                    rank: 3,
                    title: "Mr. Brightside",
                    artist: "The Killers", 
                    change: "up",
                    videoId: "gGdGFtwCNBE",
                    addedBy: "party_starter",
                    timestamp: "1 day ago"
                },
                {
                    rank: 4,
                    title: "Black Hole Sun",
                    artist: "Soundgarden",
                    change: "down",
                    videoId: "3mbBbFH9fAg",
                    addedBy: "grunge_master_93",
                    timestamp: "3 hours ago"
                },
                {
                    rank: 5,
                    title: "Such Great Heights",
                    artist: "The Postal Service",
                    change: "up",
                    videoId: "0wrsZog8qXg",
                    addedBy: "indie_explorer",
                    timestamp: "6 hours ago"
                }
            ],
            artists: [
                {
                    rank: 1,
                    name: "Nirvana",
                    genre: "Grunge",
                    change: "same",
                    followers: "45.2K",
                    description: "Pioneers of the grunge movement"
                },
                {
                    rank: 2,
                    name: "New Order",
                    genre: "Synthwave",
                    change: "up",
                    followers: "32.7K",
                    description: "Electronic music innovators"
                },
                {
                    rank: 3,
                    name: "Pearl Jam",
                    genre: "Alternative Rock",
                    change: "up",
                    followers: "38.1K",
                    description: "Seattle grunge legends"
                },
                {
                    rank: 4,
                    name: "The Postal Service",
                    genre: "Indie Electronic",
                    change: "down",
                    followers: "24.8K",
                    description: "Indie electronic pioneers"
                },
                {
                    rank: 5,
                    name: "Soundgarden",
                    genre: "Grunge",
                    change: "same",
                    followers: "29.3K",
                    description: "Heavy grunge innovators"
                }
            ],
            users: [
                {
                    rank: 1,
                    username: "grunge_master_93",
                    avatar: "🎸",
                    followers: "2.3K",
                    change: "up",
                    tracksShared: 156,
                    speciality: "Grunge & Alternative",
                    level: "Elite Curator"
                },
                {
                    rank: 2,
                    username: "vinyl_archaeologist",
                    avatar: "💿",
                    followers: "4.1K",
                    change: "same",
                    tracksShared: 287,
                    speciality: "Rare Pressings",
                    level: "Master Curator"
                },
                {
                    rank: 3,
                    username: "synth_prophet_85",
                    avatar: "🌈",
                    followers: "1.8K",
                    change: "up",
                    tracksShared: 203,
                    speciality: "80s Synthwave",
                    level: "Elite Curator"
                },
                {
                    rank: 4,
                    username: "underground_oracle",
                    avatar: "🔮",
                    followers: "3.7K",
                    change: "down",
                    tracksShared: 412,
                    speciality: "Underground Music",
                    level: "Master Curator"
                },
                {
                    rank: 5,
                    username: "indie_explorer",
                    avatar: "📮",
                    followers: "1.2K",
                    change: "up",
                    tracksShared: 89,
                    speciality: "Indie Discoveries",
                    level: "Rising Curator"
                }
            ]
        }

        // Current trending state
        let currentTrendingCategory = 'playlists'
        let currentTrendingTime = 'today'

        // Load Trending Page content
        function loadTrendingPage() {
            showTrendingCategory('playlists')
        }

        // Show trending category
        window.showTrendingCategory = function(category) {
            currentTrendingCategory = category
            
            // Hide all sections
            document.querySelectorAll('.trending-section').forEach(section => {
                section.style.display = 'none'
            })
            
            // Show selected section
            document.getElementById(`trending-${category}-section`).style.display = 'block'
            
            // Update button states
            document.querySelectorAll('[id^="trending-"][id$="-btn"]').forEach(btn => {
                btn.className = 'win95-button px-4 py-2 text-black'
            })
            document.getElementById(`trending-${category}-btn`).className = 'win95-button px-4 py-2 text-black font-bold'
            
            // Load content for category
            loadTrendingCategory(category)
        }

        // Show trending time filter
        window.showTrendingTime = function(time) {
            currentTrendingTime = time
            
            // Update button states
            document.querySelectorAll('[id^="time-"]').forEach(btn => {
                btn.className = 'win95-button px-3 py-1 text-black text-sm'
            })
            document.getElementById(`time-${time}`).className = 'win95-button px-3 py-1 text-black text-sm font-bold'
            
            // Reload current category with new time filter
            loadTrendingCategory(currentTrendingCategory)
        }

        // Load content for specific trending category
        function loadTrendingCategory(category) {
            const container = document.getElementById(`trending-${category}`)
            const data = trendingData[category]
            
            if (category === 'playlists') {
                container.innerHTML = data.map(playlist => `
                    <div class="win95-panel p-6 hover:bg-gray-100 cursor-pointer" onclick="switchToTrendingPlaylist('${playlist.id}')">
                        <div class="flex items-center gap-4">
                            <div class="text-3xl font-bold text-gray-500 min-w-[3rem]">#${playlist.rank}</div>
                            <div class="text-4xl">${playlist.icon}</div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="text-xl font-bold text-black">${playlist.name}</h3>
                                    <div class="${playlist.change === 'up' ? 'text-purple-700' : playlist.change === 'down' ? 'text-red-500' : 'text-gray-500'}">
                                        ${playlist.change === 'up' ? '▲' : playlist.change === 'down' ? '▼' : '●'}
                                    </div>
                                </div>
                                <p class="text-sm text-gray-600 mb-3">${playlist.description}</p>
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-4 h-4 rounded-full border-2 border-gray-400" style="background-color: ${playlist.color}"></div>
                                        <span class="text-sm font-bold text-black">Popular playlist</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
            } else if (category === 'songs') {
                container.innerHTML = data.map(song => `
                    <div class="win95-panel p-6 hover:bg-gray-100 cursor-pointer" onclick="playTrendingSong('${song.title}', '${song.artist}', '${song.videoId}')">
                        <div class="flex items-center gap-4">
                            <div class="text-3xl font-bold text-gray-500 min-w-[3rem]">#${song.rank}</div>
                            <img src="https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="text-lg font-bold text-black">${song.title}</h4>
                                    <div class="${song.change === 'up' ? 'text-purple-700' : song.change === 'down' ? 'text-red-500' : 'text-gray-500'}">
                                        ${song.change === 'up' ? '▲' : song.change === 'down' ? '▼' : '●'}
                                    </div>
                                </div>
                                <p class="text-sm text-gray-600 mb-2">${song.artist}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span>🎵 Trending</span>
                                    <span>Added by ${song.addedBy}</span>
                                    <span>${song.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
            } else if (category === 'artists') {
                container.innerHTML = data.map(artist => `
                    <div class="win95-panel p-6 hover:bg-gray-100 cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="text-3xl font-bold text-gray-500 min-w-[3rem]">#${artist.rank}</div>
                            <div class="text-4xl">🎤</div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="text-lg font-bold text-black">${artist.name}</h4>
                                    <div class="${artist.change === 'up' ? 'text-purple-700' : artist.change === 'down' ? 'text-red-500' : 'text-gray-500'}">
                                        ${artist.change === 'up' ? '▲' : artist.change === 'down' ? '▼' : '●'}
                                    </div>
                                </div>
                                <p class="text-sm text-gray-600 mb-2">${artist.genre} • ${artist.description}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span>🎵 Popular artist</span>
                                    <span>👥 ${artist.followers} followers</span>
                                </div>
                            </div>
                            <button class="win95-button px-4 py-2 text-sm font-bold">
                                <i class="fas fa-search mr-1"></i>Explore
                            </button>
                        </div>
                    </div>
                `).join('')
            } else if (category === 'users') {
                container.innerHTML = data.map(user => `
                    <div class="win95-panel p-6 hover:bg-gray-100 cursor-pointer" onclick="showUserProfile('${user.username}')">
                        <div class="flex items-center gap-4">
                            <div class="text-3xl font-bold text-gray-500 min-w-[3rem]">#${user.rank}</div>
                            <div class="text-4xl">${user.avatar}</div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="text-lg font-bold text-black">${user.username}</h4>
                                    <div class="${user.change === 'up' ? 'text-purple-700' : user.change === 'down' ? 'text-red-500' : 'text-gray-500'}">
                                        ${user.change === 'up' ? '▲' : user.change === 'down' ? '▼' : '●'}
                                    </div>
                                    <span class="text-sm px-2 py-1 bg-yellow-200 text-yellow-800 rounded">${user.level}</span>
                                </div>
                                <p class="text-sm text-gray-600 mb-2">${user.speciality}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span>👥 ${user.followers} followers</span>
                                    <span>🎵 ${user.tracksShared} tracks shared</span>
                                </div>
                            </div>
                            <button class="win95-button px-4 py-2 text-sm font-bold" onclick="event.stopPropagation(); followUser('${user.username}')">
                                <i class="fas fa-user-plus mr-1"></i>Follow
                            </button>
                        </div>
                    </div>
                `).join('')
            }
        }
        
        // Helper function to switch to trending playlist
        window.switchToTrendingPlaylist = function(playlistId) {
            console.log(`switchToTrendingPlaylist called with: ${playlistId}`)
            
            // Navigate to home
            window.location.hash = 'home'
            
            // Switch to the playlist after multiple delays to ensure DOM is ready
            setTimeout(() => {
                console.log('First attempt at switching playlist...')
                switchPlaylist(playlistId)
            }, 100)
            
            // Try again with a longer delay
            setTimeout(() => {
                console.log('Second attempt at switching playlist...')
                switchPlaylist(playlistId)
                showNotification(`Switched to "${playlists[playlistId]?.name}" playlist!`)
            }, 300)
        }
        
        // Helper function to switch to mood-based playlist
        window.switchToMoodPlaylist = function(playlistId) {
            console.log(`switchToMoodPlaylist called with: ${playlistId}`)
            
            // Navigate to home
            window.location.hash = 'home'
            
            // Switch to the playlist after multiple delays to ensure DOM is ready
            setTimeout(() => {
                console.log('First attempt at switching playlist...')
                switchPlaylist(playlistId)
            }, 100)
            
            // Try again with a longer delay
            setTimeout(() => {
                console.log('Second attempt at switching playlist...')
                switchPlaylist(playlistId)
                showNotification(`Switched to "${playlists[playlistId]?.name}" playlist!`)
            }, 300)
        }
        
        // Profile functionality
        let currentProfileUser = null
        const currentUser = 'VibesCurator' // This would be the logged-in user
        
        // Mock user data
        const userData = {
            'DJ_Mike92': {
                avatar: '🎧',
                bio: 'Grunge enthusiast • 90s music curator',
                joinDate: 'Sept 2024',
                topArtists: ['Nirvana', 'Pearl Jam', 'Soundgarden'],
                likedTracks: [
                    { title: 'Black', artist: 'Pearl Jam', videoId: 'cs-XZ_dN4Hc', playlistName: '90s Grunge', playlistIcon: '🎸' },
                    { title: 'Would?', artist: 'Alice in Chains', videoId: 'JB_fNVOPzyM', playlistName: '90s Grunge', playlistIcon: '🎸' },
                    { title: 'Outshined', artist: 'Soundgarden', videoId: 'sC3e2F1-fKs', playlistName: '90s Alternative', playlistIcon: '🔥' }
                ],
                repliedTracks: [
                    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', videoId: 'hTWKbfoikeg', playlistName: '90s Grunge', playlistIcon: '🎸' },
                    { title: 'Alive', artist: 'Pearl Jam', videoId: 'wGiTPgvKktM', playlistName: '90s Grunge', playlistIcon: '🎸' }
                ]
            },
            'VibesCurator': {
                avatar: '🎵',
                bio: 'Playlist architect • Music enthusiast',
                joinDate: 'Aug 2024',
                topArtists: ['Radiohead', 'Pink Floyd', 'The Beatles'],
                likedTracks: [
                    { title: 'Creep', artist: 'Radiohead', videoId: 'XFkzRNyygfk', playlistName: 'Alternative Rock', playlistIcon: '🎵' },
                    { title: 'Bohemian Rhapsody', artist: 'Queen', videoId: 'fJ9rUzIMcZQ', playlistName: 'Classic Rock', playlistIcon: '👑' },
                    { title: 'Stairway to Heaven', artist: 'Led Zeppelin', videoId: 'QkF3oxziUI4', playlistName: 'Classic Rock', playlistIcon: '👑' }
                ],
                repliedTracks: [
                    { title: 'Paranoid Android', artist: 'Radiohead', videoId: 'fHiGbolFFGw', playlistName: 'Alternative Rock', playlistIcon: '🎵' },
                    { title: 'Wish You Were Here', artist: 'Pink Floyd', videoId: 'IXdNnw99-Ic', playlistName: 'Progressive Rock', playlistIcon: '🌙' }
                ]
            },
            'RetroQueen': {
                avatar: '👑',
                bio: '80s synthwave lover • Retro revival',
                joinDate: 'Oct 2024',
                topArtists: ['Depeche Mode', 'New Order', 'Duran Duran'],
                likedTracks: [
                    { title: 'Blue Monday', artist: 'New Order', videoId: 'FYH8DsU2WCk', playlistName: '80s Synthwave', playlistIcon: '🌈' },
                    { title: 'Personal Jesus', artist: 'Depeche Mode', videoId: 'u1xrNaTO1bI', playlistName: '80s Synthwave', playlistIcon: '🌈' },
                    { title: 'Rio', artist: 'Duran Duran', videoId: 'e3W6yf6c-FA', playlistName: '80s Pop', playlistIcon: '💫' }
                ],
                repliedTracks: [
                    { title: 'Sweet Dreams', artist: 'Eurythmics', videoId: 'qeMFqkcPYcg', playlistName: '80s Synthwave', playlistIcon: '🌈' }
                ]
            },
            'System': {
                avatar: '🤖',
                bio: 'AI Music Assistant • Default curator',
                joinDate: 'July 2024',
                topArtists: ['Various Artists', 'Compilation', 'Soundtrack'],
                likedTracks: [],
                repliedTracks: []
            },
            'Discovery': {
                avatar: '🔍',
                bio: 'Music discovery engine • Recommendation bot',
                joinDate: 'July 2024',
                topArtists: ['Algorithm', 'AI Generated', 'Discovery'],
                likedTracks: [],
                repliedTracks: []
            },
            'You': {
                avatar: '😎',
                bio: 'Music lover • Active contributor',
                joinDate: 'Nov 2024',
                topArtists: ['The Strokes', 'Arctic Monkeys', 'Interpol'],
                likedTracks: [
                    { title: 'Last Nite', artist: 'The Strokes', videoId: 'TOypSnKFHrE', playlistName: 'Indie Rock', playlistIcon: '🎸' },
                    { title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', videoId: 'bpOSxM0rNPM', playlistName: 'Alternative Rock', playlistIcon: '🎵' }
                ],
                repliedTracks: [
                    { title: 'Hard to Explain', artist: 'The Strokes', videoId: 'BXkm6h6uq0k', playlistName: 'Indie Rock', playlistIcon: '🎸' }
                ]
            },
            'grunge_master_93': {
                avatar: '🎸',
                bio: 'Seattle sound specialist • Deep cuts and hidden gems from the grunge era',
                joinDate: 'March 2024',
                totalPlays: 8750,
                followers: 2300,
                tracksShared: 156,
                curatorLevel: 'Elite'
            },
            'vinyl_archaeologist': {
                avatar: '💿',
                bio: 'Digging up rare pressings and forgotten classics • Vinyl-first approach to curation',
                joinDate: 'January 2024',
                totalPlays: 15200,
                followers: 4100,
                tracksShared: 287,
                curatorLevel: 'Master'
            },
            'synth_prophet_85': {
                avatar: '🌈',
                bio: '80s synthwave evangelist • Neon dreams and electronic nostalgia curator',
                joinDate: 'February 2024',
                totalPlays: 6900,
                followers: 1800,
                tracksShared: 203,
                curatorLevel: 'Elite'
            },
            'underground_oracle': {
                avatar: '🔮',
                bio: 'Your guide to the musical underground • Discovering tomorrow\'s classics today',
                joinDate: 'December 2023',
                totalPlays: 18500,
                followers: 3700,
                tracksShared: 412,
                curatorLevel: 'Master'
            }
        }
        
        // Show user profile
        window.showUserProfile = function(username) {
            currentProfileUser = username
            window.location.hash = 'profile'
        }
        
        // Load Profile Page content
        function loadProfilePage() {
            // If no specific user profile requested, show current user
            if (!currentProfileUser) {
                currentProfileUser = currentUser
            }
            
            const user = userData[currentProfileUser] || {
                avatar: '👤',
                bio: 'Music enthusiast',
                joinDate: 'Nov 2024',
                topArtists: [],
                likedTracks: [],
                repliedTracks: []
            }
            
            // Update profile info
            document.getElementById('profile-avatar').textContent = user.avatar
            document.getElementById('profile-username').textContent = currentProfileUser
            document.getElementById('profile-bio').textContent = user.bio
            document.getElementById('profile-join-date').textContent = user.joinDate
            document.getElementById('profile-songs-by').textContent = currentProfileUser
            document.getElementById('profile-liked-by').textContent = currentProfileUser
            document.getElementById('profile-replied-by').textContent = currentProfileUser
            
            // Render top artists
            renderTopArtists(user.topArtists || [])
            
            // Get user's songs from all playlists
            const userSongs = []
            Object.keys(playlists).forEach(playlistId => {
                const playlist = playlists[playlistId]
                const playlistSongsArray = playlistSongs[playlistId] || []
                playlistSongsArray.forEach(song => {
                    if (song.addedBy === currentProfileUser) {
                        userSongs.push({
                            ...song,
                            playlistName: playlist.name,
                            playlistIcon: playlist.icon
                        })
                    }
                })
            })
            
            // Also check current playlist songs
            songs.forEach(song => {
                if (song.addedBy === currentProfileUser && !userSongs.find(s => s.id === song.id)) {
                    userSongs.push({
                        ...song,
                        playlistName: 'Current Playlist',
                        playlistIcon: '🎵'
                    })
                }
            })
            
            document.getElementById('profile-songs-count').textContent = userSongs.length
            
            // Initialize tabs
            setupProfileTabs()
            
            // Render all tab content
            renderSharedSongs(userSongs)
            renderLikedTracks(user.likedTracks || [])
            renderRepliedTracks(user.repliedTracks || [])
        }
        
        // Setup profile tabs functionality
        function setupProfileTabs() {
            const tabs = document.querySelectorAll('.profile-tab')
            const contents = document.querySelectorAll('.tab-content')
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    tabs.forEach(t => {
                        t.classList.remove('active', 'bg-gray-200', 'font-bold')
                        t.classList.add('hover:bg-gray-100')
                    })
                    
                    // Add active class to clicked tab
                    tab.classList.add('active', 'bg-gray-200', 'font-bold')
                    tab.classList.remove('hover:bg-gray-100')
                    
                    // Hide all content
                    contents.forEach(content => {
                        content.style.display = 'none'
                    })
                    
                    // Show corresponding content
                    const tabId = tab.id.replace('tab-', 'tab-content-')
                    const targetContent = document.getElementById(tabId)
                    if (targetContent) {
                        targetContent.style.display = 'block'
                    }
                })
            })
        }
        
        // Render top artists
        function renderTopArtists(artists) {
            const container = document.getElementById('profile-top-artists')
            if (artists.length === 0) {
                container.innerHTML = `<div class="text-gray-500">No top artists data available</div>`
                return
            }
            
            const medals = ['🥇', '🥈', '🥉']
            
            container.innerHTML = artists.slice(0, 3).map((artist, index) => `
                <div class="flex-1 win95-panel p-4 text-center">
                    <div class="text-2xl mb-2">${medals[index] || '🎤'}</div>
                    <div class="font-bold text-black text-sm">${artist}</div>
                </div>
            `).join('')
        }
        
        // Render shared songs
        function renderSharedSongs(userSongs) {
            const container = document.getElementById('profile-songs-list')
            if (userSongs.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">🎵</div>
                        <p>No songs added yet</p>
                    </div>
                `
            } else {
                container.innerHTML = userSongs.map(song => `
                    <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onclick="playUserSong('${song.title}', '${song.artist}', '${song.videoId || 'dQw4w9WgXcQ'}')">
                        <div class="flex items-center gap-4">
                            <img src="https://img.youtube.com/vi/${song.videoId || 'dQw4w9WgXcQ'}/mqdefault.jpg" 
                                 class="w-16 h-12 object-cover rounded" />
                            <div class="flex-1">
                                <h4 class="font-bold text-black">${song.title}</h4>
                                <p class="text-sm text-gray-600">${song.artist}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-sm text-gray-500">${song.playlistIcon} ${song.playlistName}</span>
                                    <span class="text-sm text-gray-500">• ${song.duration || '3:45'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
            }
        }
        
        // Render liked tracks
        function renderLikedTracks(likedTracks) {
            const container = document.getElementById('profile-liked-list')
            if (likedTracks.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">❤️</div>
                        <p>No liked tracks yet</p>
                    </div>
                `
            } else {
                container.innerHTML = likedTracks.map(song => `
                    <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onclick="playUserSong('${song.title}', '${song.artist}', '${song.videoId || 'dQw4w9WgXcQ'}')">
                        <div class="flex items-center gap-4">
                            <img src="https://img.youtube.com/vi/${song.videoId || 'dQw4w9WgXcQ'}/mqdefault.jpg" 
                                 class="w-16 h-12 object-cover rounded" />
                            <div class="flex-1">
                                <h4 class="font-bold text-black">${song.title}</h4>
                                <p class="text-sm text-gray-600">${song.artist}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-sm text-gray-500">${song.playlistIcon} ${song.playlistName}</span>
                                    <span class="text-sm text-gray-500">• ❤️ Liked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
            }
        }
        
        // Render replied tracks
        function renderRepliedTracks(repliedTracks) {
            const container = document.getElementById('profile-replied-list')
            if (repliedTracks.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">💬</div>
                        <p>No replied tracks yet</p>
                    </div>
                `
            } else {
                container.innerHTML = repliedTracks.map(song => `
                    <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onclick="playUserSong('${song.title}', '${song.artist}', '${song.videoId || 'dQw4w9WgXcQ'}')">
                        <div class="flex items-center gap-4">
                            <img src="https://img.youtube.com/vi/${song.videoId || 'dQw4w9WgXcQ'}/mqdefault.jpg" 
                                 class="w-16 h-12 object-cover rounded" />
                            <div class="flex-1">
                                <h4 class="font-bold text-black">${song.title}</h4>
                                <p class="text-sm text-gray-600">${song.artist}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-sm text-gray-500">${song.playlistIcon} ${song.playlistName}</span>
                                    <span class="text-sm text-gray-500">• 💬 Replied</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
            }
        }
        
        // Make reply functions globally accessible
        window.showReplies = showReplies
        window.closeReplies = closeReplies
        window.addReply = addReply
        
        // Play song from user profile
        window.playUserSong = function(title, artist, videoId) {
            // Check if song exists in current playlist
            const existingSong = songs.find(s => s.title === title && s.artist === artist)
            
            if (existingSong) {
                // Navigate to home and play existing song
                window.location.hash = 'home'
                setTimeout(() => {
                    currentSongId = existingSong.id
                    isPlaying = true
                    updatePlayer()
                    updatePlayButton()
                    renderPlaylist()
                    showNotification(`Now playing "${title}"!`)
                }, 100)
            } else {
                // Add to current playlist and play
                addTrackFromRecommendation(title, artist, videoId)
            }
        }
        
        // Show notification
        function showNotification(message) {
            const notification = document.createElement('div')
            notification.className = 'fixed bottom-20 right-4 win95-panel p-4 animate-slide-in z-50'
            notification.innerHTML = `
                <div class="flex items-center gap-2">
                    <i class="fas fa-check-circle text-purple-700"></i>
                    <span class="text-black font-bold">${message}</span>
                </div>
            `
            document.body.appendChild(notification)
            
            setTimeout(() => {
                notification.remove()
            }, 3000)
        }
        
        // Helper function to add tracks from recommendations
        window.addTrackFromRecommendation = function(title, artist, videoId) {
            const newSong = {
                id: Date.now().toString(),
                title: title,
                artist: artist,
                duration: '3:30',
                videoId: videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                addedBy: 'Discovery',
                userAvatar: '🔍',
                timestamp: 'just now',
                comment: 'Discovered through recommendations',
                likes: Math.floor(Math.random() * 20) + 3,
                recasts: Math.floor(Math.random() * 10) + 1,
                replies: Math.floor(Math.random() * 5) + 1,
            }
            songs.push(newSong)
            
            // Navigate to home and play the song
            window.location.hash = 'home'
            
            // Play the new song after a short delay to ensure page has switched
            setTimeout(() => {
                currentSongId = newSong.id
                isPlaying = true
                renderPlaylist()
                updatePlayer()
                updatePlayButton()
                showNotification(`Now playing "${title}" by ${artist}"!`)
            }, 100)
        }
        
        // Helper function to play trending songs
        window.playTrendingSong = function(title, artist, videoId = 'dQw4w9WgXcQ') {
            
            const existingSong = songs.find(s => s.title === title && s.artist === artist)
            
            if (existingSong) {
                // Song already in playlist, just play it
                window.location.hash = 'home'
                setTimeout(() => {
                    currentSongId = existingSong.id
                    isPlaying = true
                    updatePlayer()
                    updatePlayButton()
                    showNotification(`Now playing "${title}"!`)
                }, 100)
            } else {
                // Add and play
                addTrackFromRecommendation(title, artist, videoId)
            }
        }

        // Discovery Features Functions
        
        // Follow user functionality
        window.followUser = function(username) {
            showNotification(`Now following ${username}! You'll see their latest additions in your feed.`)
        }
        
        
        // Play Hidden Gem
        window.playHiddenGem = function(title, artist, videoId) {
            const newSong = {
                id: Date.now().toString(),
                title: title,
                artist: artist,
                duration: '3:45',
                videoId: videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                addedBy: 'Discovery',
                userAvatar: '💎',
                timestamp: 'just now',
                comment: 'Hidden gem discovered! This is a rare find.',
                likes: Math.floor(Math.random() * 15) + 8,
                recasts: Math.floor(Math.random() * 8) + 2,
                replies: Math.floor(Math.random() * 5) + 1
            }
            
            songs.unshift(newSong)
            
            // Navigate to home and play
            window.location.hash = 'home'
            setTimeout(() => {
                currentSongId = newSong.id
                isPlaying = true
                renderPlaylist()
                updatePlayer()
                updatePlayButton()
                showNotification(`Now playing hidden gem: "${title}"!`)
            }, 100)
        }
        
        // Explore Genre Blending
        window.exploreGenreBlend = function(blend) {
            const blendData = {
                'grunge-hiphop': {
                    songs: [
                        { title: "Killing in the Name", artist: "Rage Against the Machine", videoId: "bWXazVhlyxQ" },
                        { title: "Sabotage", artist: "Beastie Boys", videoId: "z5rRZdiu1UE" },
                        { title: "Even Flow", artist: "Pearl Jam", videoId: "tkbgtVFlyCQ" }
                    ],
                    message: "Grunge × Hip-Hop blend discovered!"
                },
                'synthwave-indie': {
                    songs: [
                        { title: "Such Great Heights", artist: "The Postal Service", videoId: "0wrsZog8qXg" },
                        { title: "Blue Monday", artist: "New Order", videoId: "FYH8DsU2WCk" },
                        { title: "Young Folks", artist: "Peter Bjorn and John", videoId: "OIRE6iw-ws4" }
                    ],
                    message: "Synthwave × Indie fusion ready!"
                }
            }
            
            const blendPlaylist = blendData[blend]
            if (blendPlaylist) {
                // Add blended songs
                blendPlaylist.songs.forEach(song => {
                    const newSong = {
                        id: Date.now().toString() + Math.random(),
                        title: song.title,
                        artist: song.artist,
                        duration: '3:30',
                        videoId: song.videoId,
                        thumbnail: `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`,
                        addedBy: 'Discovery',
                        userAvatar: '🎭',
                        timestamp: 'just now',
                        comment: `Genre-blended discovery: ${blend.replace('-', ' × ')}`,
                        likes: Math.floor(Math.random() * 20) + 8,
                        recasts: Math.floor(Math.random() * 12) + 3,
                        replies: Math.floor(Math.random() * 6) + 2
                    }
                    songs.unshift(newSong)
                })
                
                // Navigate to home and show results
                window.location.hash = 'home'
                setTimeout(() => {
                    renderPlaylist()
                    showNotification(blendPlaylist.message)
                }, 100)
            }
        }

        // Initialize
        initRouter()
        renderPlaylist()
        updatePlayer()
        updatePlayButton()
        updateSortButtons()
        updateTime()
        setInterval(updateTime, 1000)
        
        // Set initial AI toggle button text (hidden by default)
        document.getElementById('ai-toggle-btn').innerHTML = '<i class="fas fa-robot mr-1"></i>🤖 DJ Bot'
        
        console.log('%c🎧 VIBES 95 SYSTEM LOADED', 'color: #00ff00; font-family: monospace; font-size: 14px; font-weight: bold;')
        console.log('%c🤖 DJ Bot 95 AI Assistant Ready!', 'color: #00ffff; font-family: monospace;')
        console.log('%c🔍 Enhanced Discovery System Online!', 'color: #ff00ff; font-family: monospace;')
        console.log('%cReplace YOUTUBE_API_KEY with your real API key for live search!', 'color: #ffff00; font-family: monospace;')
        
        // Terminal functionality (moved to global scope)
        window.terminalHistory = []
        window.historyIndex = -1
        
        // Terminal commands
        window.terminalCommands = {
            help: () => {
                return `Available commands:
  help     - Show this help message
  clear    - Clear the terminal screen
  vibes    - Return to the main application
  about    - About this terminal
  time     - Show current time
  whoami   - Show current user
  ls       - List available features
  exit     - Return to main app (alias for vibes)
  
Type any command followed by Enter.`
            },
            clear: () => {
                document.getElementById('terminal-output').textContent = ''
                return ''
            },
            vibes: () => {
                window.hideTerminal()
                return 'Returning to VIBES music platform...'
            },
            exit: () => {
                window.hideTerminal()
                return 'Returning to VIBES music platform...'
            },
            about: () => {
                return `VIBES TERMINAL v1.0.0
A retro-style command interface for the VIBES music platform.
Built with love for music and nostalgia.

Easter egg discovered! 🎉`
            },
            time: () => {
                return new Date().toLocaleString()
            },
            whoami: () => {
                return 'vibes-user (Music enthusiast and vinyl archaeologist)'
            },
            ls: () => {
                return `Available features:
  📀 playlists/     - Music collections
  🎵 player/        - Audio playback system  
  👤 profiles/      - User profiles
  🤖 ai-assistant/  - DJ Bot AI
  🔍 discovery/     - Music discovery engine
  💬 social/        - Comments and replies`
            }
        }
        
        
        // Hide terminal
        window.hideTerminal = function() {
            document.getElementById('terminal-screen').style.display = 'none'
        }
        
        // Add line to terminal output
        window.addTerminalLine = function(text, isCommand = false) {
            const output = document.getElementById('terminal-output')
            if (isCommand) {
                output.textContent += `vibes@terminal:~$ ${text}\n`
            } else {
                output.textContent += `${text}\n`
            }
            // Auto-scroll to bottom
            output.parentElement.scrollTop = output.parentElement.scrollHeight
        }
        
        // Handle terminal input
        document.addEventListener('DOMContentLoaded', function() {
            const terminalInput = document.getElementById('terminal-input')
            
            if (terminalInput) {
                terminalInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        const command = this.value.trim().toLowerCase()
                        
                        // Add command to output
                        window.addTerminalLine(this.value, true)
                        
                        // Add to history
                        if (command && window.terminalHistory[window.terminalHistory.length - 1] !== command) {
                            window.terminalHistory.push(command)
                        }
                        window.historyIndex = window.terminalHistory.length
                        
                        // Execute command
                        if (command === '') {
                            // Empty command
                        } else if (window.terminalCommands[command]) {
                            const result = window.terminalCommands[command]()
                            if (result) {
                                window.addTerminalLine(result)
                            }
                        } else {
                            window.addTerminalLine(`Command not found: ${command}. Type 'help' for available commands.`)
                        }
                        
                        // Clear input
                        this.value = ''
                    } else if (e.key === 'ArrowUp') {
                        // Navigate history up
                        e.preventDefault()
                        if (window.historyIndex > 0) {
                            window.historyIndex--
                            this.value = window.terminalHistory[window.historyIndex]
                        }
                    } else if (e.key === 'ArrowDown') {
                        // Navigate history down
                        e.preventDefault()
                        if (window.historyIndex < window.terminalHistory.length - 1) {
                            window.historyIndex++
                            this.value = window.terminalHistory[window.historyIndex]
                        } else {
                            window.historyIndex = window.terminalHistory.length
                            this.value = ''
                        }
                    } else if (e.key === 'Tab') {
                        // Tab completion
                        e.preventDefault()
                        const partial = this.value.toLowerCase()
                        const matches = Object.keys(window.terminalCommands).filter(cmd => cmd.startsWith(partial))
                        if (matches.length === 1) {
                            this.value = matches[0]
                        } else if (matches.length > 1) {
                            window.addTerminalLine(`Possible completions: ${matches.join(', ')}`)
                        }
                    }
                })
            }
        })
        
