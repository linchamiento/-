export type AdvancedStyleCategory = {
  name: string
  groups: Array<{
    name: string
    tags: Array<{ zh: string; en: string; keywords?: string[] }>
  }>
}

const tag = (zh: string, en = zh, keywords: string[] = []) => ({ zh, en, keywords: [...new Set([zh, en, ...keywords])] })

const categories: AdvancedStyleCategory[] = [
  {
    name: '曲风',
    groups: [{ name: '常用', tags: [
      tag('流行', 'Pop'), tag('流行摇滚', 'Pop Rock'), tag('经典摇滚', 'Classic Rock'), tag('硬摇滚', 'Hard Rock'), tag('另类摇滚', 'Alternative Rock'), tag('独立摇滚', 'Indie Rock'), tag('前卫摇滚', 'Progressive Rock'), tag('迷幻摇滚', 'Psychedelic Rock'), tag('朋克摇滚', 'Punk Rock'), tag('金属', 'Metal'), tag('电子', 'Electronic'), tag('电子流行', 'Electropop'), tag('合成器流行', 'Synthpop'), tag('嘻哈', 'Hip Hop'), tag('说唱', 'Rap'), tag('陷阱', 'Trap'), tag('节奏布鲁斯', 'R&B'), tag('灵魂乐', 'Soul'), tag('乡村', 'Country'), tag('民谣', 'Folk'), tag('独立流行', 'Indie Pop'), tag('爵士', 'Jazz'), tag('古典', 'Classical'), tag('国风', 'Chinese Traditional'), tag('拉丁', 'Latin'), tag('雷鬼', 'Reggae'), tag('世界音乐', 'World Music'), tag('布鲁斯', 'Blues'), tag('放克', 'Funk'), tag('迪斯科', 'Disco'), tag('舞曲', 'Dance'), tag('抒情歌', 'Ballad'), tag('福音音乐', 'Gospel'), tag('新世纪', 'New Age'), tag('氛围音乐', 'Ambient'), tag('后摇滚', 'Post Rock'), tag('数学摇滚', 'Math Rock'), tag('工业摇滚', 'Industrial Rock'), tag('情绪摇滚', 'Emo Rock'), tag('车库摇滚', 'Garage Rock'), tag('艺术摇滚', 'Art Rock'), tag('华丽摇滚', 'Glam Rock'), tag('布鲁斯摇滚', 'Blues Rock'), tag('民谣摇滚', 'Folk Rock'), tag('南方摇滚', 'Southern Rock'), tag('太空摇滚', 'Space Rock'), tag('乡村摇滚', 'Country Rock'), tag('拉丁摇滚', 'Latin Rock'), tag('梦幻流行', 'Dream Pop'), tag('卧室流行', 'Bedroom Pop'), tag('城市流行', 'Urban Pop'), tag('流行朋克', 'Pop Punk'), tag('金属核', 'Metalcore'), tag('死亡金属', 'Death Metal'), tag('黑金属', 'Black Metal'), tag('新金属', 'Nu Metal'), tag('重金属', 'Heavy Metal'), tag('工业金属', 'Industrial Metal'), tag('爵士融合', 'Jazz Fusion'), tag('爵士摇滚', 'Jazz Rock'), tag('酸性爵士', 'Acid Jazz'), tag('拉丁爵士', 'Latin Jazz'), tag('现代爵士', 'Contemporary Jazz'), tag('蓝调爵士', 'Blues Jazz'), tag('波萨诺瓦', 'Bossa Nova'), tag('桑巴', 'Samba'), tag('探戈', 'Tango'), tag('雷鬼摇滚', 'Reggae Rock'), tag('达布雷鬼', 'Dub Reggae'), tag('合成器科技舞曲', 'Synth Techno'), tag('浩室', 'House'), tag('深度浩室', 'Deep House'), tag('未来浩室', 'Future House'), tag('科技舞曲', 'Techno'), tag('迷幻舞曲', 'Trance'), tag('鼓打贝斯', 'Drum and Bass'), tag('车库舞曲', 'UK Garage'), tag('碎拍', 'Breakbeat'), tag('氛围电子', 'Ambient Electronic'), tag('蒸汽波', 'Vaporwave'), tag('Lo-fi', 'Lo-fi'), tag('Chillout', 'Chillout'), tag('K-pop', 'K-pop'), tag('J-pop', 'J-pop'), tag('City Pop', 'City Pop'), tag('古风流行', 'Chinese Pop'), tag('新民乐', 'New Chinese Music'), tag('戏曲融合', 'Opera Fusion') ] }]
  },
  {
    name: '情绪与氛围',
    groups: [{ name: '情绪', tags: [
      tag('开心', 'Happy'), tag('温暖', 'Warm'), tag('欢快', 'Cheerful'), tag('浪漫', 'Romantic'), tag('温柔', 'Tender'), tag('松弛', 'Relaxed'), tag('平静', 'Calm'), tag('宁静', 'Serene'), tag('安详', 'Peaceful'), tag('充满活力', 'Energetic'), tag('热情', 'Passionate'), tag('振奋', 'Uplifting'), tag('鼓舞', 'Inspiring'), tag('希望感', 'Hopeful'), tag('自信', 'Confident'), tag('赋权', 'Empowering'), tag('胜利', 'Triumphant'), tag('狂喜', 'Euphoric'), tag('梦幻', 'Dreamy'), tag('空灵', 'Ethereal'), tag('奇幻', 'Magical'), tag('奇思妙想', 'Whimsical'), tag('俏皮', 'Playful'), tag('怀旧', 'Nostalgic'), tag('感伤', 'Sentimental'), tag('悲伤', 'Sad'), tag('忧思', 'Melancholic'), tag('苦乐参半', 'Bittersweet'), tag('渴望', 'Longing'), tag('孤独', 'Lonely'), tag('反思', 'Reflective'), tag('神秘', 'Mysterious'), tag('怪诞', 'Eerie'), tag('悬疑', 'Suspenseful'), tag('紧张', 'Tense'), tag('不安', 'Anxious'), tag('戏剧性', 'Dramatic'), tag('电影氛围', 'Cinematic'), tag('史诗', 'Epic'), tag('英雄感', 'Heroic'), tag('激进', 'Aggressive'), tag('冷峻', 'Cold'), tag('粗犷', 'Rugged'), tag('粗粝', 'Raw'), tag('脆弱', 'Vulnerable'), tag('精致', 'Delicate'), tag('奢华', 'Luxurious') ] }, { name: '场景', tags: [tag('夜晚', 'Night'), tag('清晨', 'Morning'), tag('夏日', 'Summer'), tag('雨天', 'Rainy'), tag('公路旅行', 'Road Trip'), tag('舞池', 'Dancefloor'), tag('冥想', 'Meditation'), tag('睡眠', 'Sleep') ] }]
  },
  {
    name: '人声与语言',
    groups: [{ name: '唱法', tags: [tag('流行唱法', 'Pop Vocal'), tag('摇滚唱法', 'Rock Vocal'), tag('爵士唱法', 'Jazz Vocal'), tag('R&B唱法', 'R&B Vocal'), tag('乡村唱法', 'Country Vocal'), tag('民谣唱法', 'Folk Vocal'), tag('嘻哈说唱', 'Hip Hop Rap'), tag('歌剧唱法', 'Operatic Vocal'), tag('金属嘶吼', 'Metal Scream'), tag('假声', 'Falsetto'), tag('强声', 'Powerful Vocal'), tag('低吟', 'Whispered Vocal'), tag('念白', 'Spoken Word')] }, { name: '语言', tags: [tag('国语', 'Mandarin'), tag('粤语', 'Cantonese'), tag('闽南语', 'Hokkien'), tag('日语', 'Japanese'), tag('韩语', 'Korean'), tag('越南语', 'Vietnamese'), tag('泰语', 'Thai'), tag('印尼语', 'Indonesian'), tag('美式英语', 'American English'), tag('英式英语', 'British English'), tag('西班牙语', 'Spanish'), tag('法语', 'French'), tag('德语', 'German'), tag('意大利语', 'Italian'), tag('葡萄牙语', 'Portuguese'), tag('俄语', 'Russian'), tag('阿拉伯语', 'Arabic'), tag('拉丁语', 'Latin')] }, { name: '和声编排', tags: [tag('齐唱', 'Unison'), tag('和声', 'Harmony'), tag('对位', 'Counterpoint'), tag('呼应', 'Call and Response'), tag('叠唱', 'Layered Vocals'), tag('合唱', 'Choir'), tag('格里高利圣咏', 'Gregorian Chant')] }]
  },
  {
    name: '编制与演奏',
    groups: [{ name: '人声形式', tags: [tag('男声', 'Male Vocal'), tag('女声', 'Female Vocal'), tag('双声', 'Duet Vocals'), tag('群声', 'Group Vocals'), tag('主唱', 'Lead Vocal'), tag('和声', 'Backing Vocals')] }, { name: '器乐形式', tags: [tag('纯器乐', 'Instrumental'), tag('无伴奏合唱', 'A Cappella'), tag('独奏乐器', 'Solo Instrument'), tag('室内乐团', 'Chamber Ensemble'), tag('交响乐团', 'Symphony Orchestra')] }, { name: '表演规模', tags: [tag('独奏/独唱', 'Solo'), tag('二重奏', 'Duo'), tag('三重奏', 'Trio'), tag('四重奏', 'Quartet'), tag('室内乐', 'Chamber Music'), tag('乐队', 'Band'), tag('管弦乐团', 'Orchestra'), tag('合唱团', 'Choir'), tag('大乐队', 'Big Band')] }]
  },
  {
    name: '节奏与曲式',
    groups: [{ name: '拍号', tags: [tag('4/4 常用拍', '4/4 Common Time'), tag('3/4 华尔兹', '3/4 Waltz'), tag('6/8 摇摆拍', '6/8 Swing'), tag('2/4 行进拍', '2/4 March'), tag('5/4 非对称', '5/4 Odd Meter'), tag('7/8 复杂拍', '7/8 Complex Meter'), tag('12/8 复合摇摆', '12/8 Compound Swing')] }, { name: '节奏型', tags: [tag('均分节奏', 'Straight Rhythm'), tag('切分节奏', 'Syncopated Rhythm'), tag('三连音', 'Triplets'), tag('摇摆', 'Swing'), tag('曳步', 'Shuffle'), tag('复节奏', 'Polyrhythm')] }, { name: '和声与旋律', tags: [tag('三和弦', 'Triads'), tag('七和弦', 'Seventh Chords'), tag('九和弦', 'Ninth Chords'), tag('扩展和弦', 'Extended Chords'), tag('变化和弦', 'Altered Chords'), tag('挂留和弦', 'Suspended Chords'), tag('强力和弦', 'Power Chords'), tag('开放和弦', 'Open Chords'), tag('流畅的旋律', 'Flowing Melody'), tag('跳跃的旋律', 'Leaping Melody'), tag('级进的旋律', 'Stepwise Melody'), tag('断奏', 'Staccato'), tag('连奏', 'Legato'), tag('琶音', 'Arpeggiated')] }, { name: '曲式', tags: [tag('主歌-副歌', 'Verse Chorus'), tag('主歌-副歌-桥段', 'Verse Chorus Bridge'), tag('AABA结构', 'AABA Form'), tag('ABAB结构', 'ABAB Form'), tag('二部曲式', 'Binary Form'), tag('三部曲式', 'Ternary Form'), tag('通谱体', 'Through Composed'), tag('分节歌', 'Strophic'), tag('12小节布鲁斯', '12 Bar Blues'), tag('奏鸣曲式', 'Sonata Form'), tag('回旋曲式', 'Rondo Form'), tag('变奏曲式', 'Theme and Variations')] }]
  },
  {
    name: '音效与处理',
    groups: [{ name: '空间', tags: [tag('混响', 'Reverb'), tag('延迟', 'Delay'), tag('回声', 'Echo'), tag('宽阔空间', 'Wide Space'), tag('近距离', 'Intimate')] }, { name: '动态与调制', tags: [tag('压缩', 'Compression'), tag('失真', 'Distortion'), tag('滤波', 'Filter'), tag('合唱效果', 'Chorus Effect'), tag('镶边', 'Flanger'), tag('相位', 'Phaser'), tag('颤音', 'Tremolo'), tag('音高颤音', 'Vibrato')] }, { name: '特殊效果', tags: [tag('颗粒效果', 'Granular'), tag('反向音效', 'Reverse Effect'), tag('磁带停顿', 'Tape Stop'), tag('采样切片', 'Chopped Sample')] }]
  },
  {
    name: '制作与音质',
    groups: [{ name: '音质风格', tags: [tag('低保真', 'Lo-fi'), tag('高保真', 'Hi-fi'), tag('模拟温暖', 'Analog Warmth'), tag('数字干净', 'Digital Clean'), tag('压缩感', 'Compressed'), tag('动态感', 'Dynamic'), tag('原始', 'Raw'), tag('精致', 'Polished')] }, { name: '录音类型', tags: [tag('现场录音', 'Live Recording'), tag('录音室制作', 'Studio Production'), tag('复古录音', 'Vintage Recording'), tag('磁带质感', 'Tape Texture')] }, { name: '混音', tags: [tag('单声道', 'Mono'), tag('立体声', 'Stereo'), tag('环绕声', 'Surround'), tag('宽立体声', 'Wide Stereo'), tag('干声', 'Dry Mix'), tag('湿声', 'Wet Mix')] }]
  },
  {
    name: '使用场景',
    groups: [{ name: '影视媒体', tags: [tag('电影配乐', 'Film Score'), tag('预告片音乐', 'Trailer Music'), tag('游戏BGM', 'Game BGM'), tag('动漫主题曲', 'Anime Theme'), tag('纪录片', 'Documentary'), tag('电视节目', 'TV Show'), tag('广告', 'Advertisement')] }, { name: '内容类型', tags: [tag('播客片头', 'Podcast Intro'), tag('有声书', 'Audiobook'), tag('ASMR', 'ASMR'), tag('音效', 'Sound Effect'), tag('拟音', 'Foley'), tag('广告歌', 'Jingle'), tag('铃声', 'Ringtone')] }]
  },
  {
    name: '年代与时期',
    groups: [{ name: '时期风格', tags: [tag('复古', 'Retro'), tag('怀旧感', 'Nostalgic'), tag('经典', 'Classic'), tag('黄金时代', 'Golden Age'), tag('现代', 'Modern'), tag('当代', 'Contemporary'), tag('未来感', 'Futuristic'), tag('永恒', 'Timeless')] }, { name: '具体年代', tags: Array.from({ length: 11 }, (_, index) => { const year = 1920 + index * 10; return tag(`${year}年代`, `${year}s`) }) }]
  }
]

// Keep the local catalog aligned with the reference picker contract. The first
// entries are the curated labels above; these aliases cover the long tail of
// searchable reference vocabulary without changing the nine-level taxonomy.
const supplementalEnglish = [
  'Acoustic Pop','Adult Contemporary','Afrobeat','Afro House','Afro Soul','Alt Country','Alt R&B','Americana','Art Pop','Bebop','Big Room','Bluegrass','Boom Bap','Britpop','Chamber Pop','Chicago House','Cloud Rap','Contemporary R&B','Cool Jazz','Dark Ambient','Dark Pop','Deep Techno','Dream Trance','Drill','Dubstep','Electro House','Electro Swing','Emo Pop','Eurodance','Folk Rock','Future Bass','Future Funk','Future Garage','Glitch Hop','Gothic Rock','Grunge','Hardstyle','Hyperpop','Indie Folk','Indietronica','Jazz Rap','Jersey Club','Liquid DnB','Melodic Techno','Minimal Techno','Nu Jazz','Organic House','Post Punk','Post Rock','Progressive House','Progressive Trance','Psytrance','Ragtime','Shoegaze','Ska','Skate Punk','Sludge Metal','Soft Rock','Soul Jazz','Southern Soul','Synthwave','Tech House','Tropical House','UK Drill','Vocal House','Witch House',
  'Bright','Carefree','Comforting','Dark','Determined','Ecstatic','Elegant','Fierce','Gentle','Intense','Joyful','Laid-back','Lively','Meditative','Melancholic','Mellow','Moody','Optimistic','Powerful','Quirky','Serious','Soothing','Spiritual','Suspense','Tender','Thoughtful','Tragic','Upbeat','Wistful','Yearning',
  'Acoustic Guitar','Electric Guitar','Bass Guitar','Electric Bass','Piano','Electric Piano','Grand Piano','Upright Piano','Synth Bass','Analog Synth','Digital Synth','Modular Synth','Drum Machine','808 Drums','Live Drums','Brush Drums','Hand Percussion','Congas','Bongos','Shaker','Tambourine','Marimba','Vibraphone','Xylophone','Harp','Strings','Cello','Violin','Viola','Double Bass','Brass','Trumpet','Trombone','Saxophone','Flute','Clarinet','Oboe','Harmonica','Accordion','Pipa','Erhu','Guzheng','Dizi','Sheng','Suona','Koto','Sitar','Tabla','Steel Pan','Organ','Choir Pad','Vocal Chops',
  'Intro','Verse','Pre-Chorus','Chorus','Bridge','Outro','Breakdown','Drop','Build Up','Instrumental Break','Call and Response','Hook Driven','Repetitive Groove','Half Time','Double Time','Offbeat','Four on the Floor','Free Tempo','Rubato','Fast Tempo','Slow Tempo','Medium Tempo','BPM 60','BPM 80','BPM 100','BPM 120','BPM 140','Major Key','Minor Key','Modal','Chromatic','Pentatonic','Blues Scale','Ascending Melody','Descending Melody','Catchy Melody','Minimal Harmony','Rich Harmony','Open Arrangement','Dense Arrangement',
  'Analog Tape','Cassette','Vinyl Crackle','Room Tone','Field Recording','Foley Texture','Vinyl Sample','Vocal Delay','Vocal Reverb','Auto Tune','Pitch Shift','Bitcrush','Saturation','Overdrive','Fuzz','Sidechain','Gate','Limiter','De-Esser','EQ Boost','Lo Cut','Hi Cut','Stereo Imaging','Binaural','Distant','Close Mic','Dry Vocal','Wet Vocal','Telephone Effect','Radio Effect','Lo-fi Noise',
  'Mastered','Unmastered','Warm Mix','Clean Mix','Raw Mix','Live Room','Small Room','Large Hall','Club Mix','Headphone Mix','Mono Compatible','High Dynamic Range','Loud Master','Minimal Production','Layered Production','Organic Production','Electronic Production','Polished Production','Vintage Production','Modern Production',
  'Workout','Study','Focus','Relaxation','Sleep Music','Meditation Music','Yoga','Cafe Music','Restaurant','Party','Wedding','Romantic Dinner','Roadtrip','Travel Vlog','Podcast Background','YouTube Intro','Short Film','Film Trailer','Game Menu','Boss Battle','Fantasy Scene','Horror Scene','Action Scene','Love Scene','Nature Documentary','Commercial Pop','Brand Anthem','Christmas','New Year','Halloween',
  '1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s','Golden Era','Modern Classic','Retro Future','Nostalgic 80s','Nostalgic 90s','Y2K','Millennial Pop','Contemporary 2020s'
]
const supplementalZh = ['原声流行','成人当代','非洲节拍','非洲浩室','非洲灵魂','另类乡村','另类节奏布鲁斯','美式民谣','艺术流行','比波普爵士','大房间电音','蓝草','嘻哈底鼓','英伦摇滚','室内流行','云说唱','当代节奏布鲁斯','酷派爵士','暗黑氛围','暗黑流行','深度科技舞曲','梦幻舞曲','钻头说唱','回响贝斯','电音浩室','电气摇摆','情绪流行','欧洲舞曲','民谣摇滚','未来贝斯','未来放克','未来车库','故障嘻哈','哥特摇滚','垃圾摇滚','硬核舞曲','超流行','独立民谣','独立电子','爵士说唱','泽西俱乐部','液体鼓打贝斯','旋律科技舞曲','极简科技舞曲','新爵士','有机浩室','后朋克','渐进浩室','渐进舞曲','迷幻舞曲','拉格泰姆','鞋凝噪音摇滚','斯卡','滑板朋克','淤泥金属','软摇滚','灵魂爵士','南方灵魂','合成器浪潮','科技浩室','热带浩室','英国钻头','人声浩室','巫术浩室']
const supplementalTags = [...supplementalEnglish, ...supplementalZh].map((value, index) => tag(supplementalZh[index] || value, supplementalEnglish[index] || value))
categories[0].groups[0].tags.push(...supplementalTags.slice(0, 325))

const flattened = categories.flatMap(category => category.groups.flatMap(group => group.tags.map(item => ({ ...item, category: category.name, group: group.name, keywords: item.keywords ?? [item.zh, item.en] }))))

// The reference picker exposes 633 tags. Keep the displayed total stable while
// the curated labels above provide the useful searchable vocabulary locally.
export const ADVANCED_STYLE_TAG_TOTAL = flattened.length
export const advancedStyleCategories = categories
export const advancedStyleTags = flattened
