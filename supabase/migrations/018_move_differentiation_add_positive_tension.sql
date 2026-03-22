-- Move "Differentiation Over Enmeshment" chapter from Womanese to Relationship Frame Workshop
-- Add new "Positive Emotional Tension" chapter to Womanese (based on Dr. Robert Glover)

SET search_path TO public;

-- ============================================================
-- Phase 1: Move Differentiation chapter to Relationship Frame Workshop
-- ============================================================

UPDATE chapters
SET course_id = '00000000-0000-0000-0000-000000000006',
    sort_order = 0
WHERE id = '10000000-0000-0000-0000-000000000016';

-- ============================================================
-- Phase 2: Adjust Womanese sort orders and insert new chapter
-- ============================================================

-- Bump De-escalating Conflict from sort_order 3 to 4
UPDATE chapters
SET sort_order = 4
WHERE id = '10000000-0000-0000-0000-000000000015';

-- Insert Positive Emotional Tension at sort_order 3
INSERT INTO chapters (id, course_id, title, description, sort_order) VALUES (
  '10000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000010',
  'Positive Emotional Tension',
  'Learn why Nice Guys kill attraction by collapsing all tension, how to hold positive emotional tension as described by Dr. Robert Glover, and practical ways to create healthy polarity through differentiated living.',
  3
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Phase 3: Insert lessons for Positive Emotional Tension
-- ============================================================

-- Lesson 1: Why Nice Guys Kill the Spark
INSERT INTO lessons (id, chapter_id, title, description, sort_order, duration_seconds, video_source_type, video_url, is_preview, content, journal_prompts) VALUES (
  '20000000-0000-0000-0000-000000000226',
  '10000000-0000-0000-0000-000000000022',
  'Why Nice Guys Kill the Spark',
  'Understand how collapsing tension through people-pleasing, approval-seeking, and conflict avoidance systematically destroys attraction and polarity.',
  0,
  2100,
  'youtube',
  'https://www.youtube.com/watch?v=rb1CbqHaolM',
  false,
  $$## Full Script

There is a pattern that runs through almost every Nice Guy relationship, and it is invisible to the man living it. He thinks he is being a good partner. He thinks he is doing everything right. He is attentive, agreeable, accommodating, and available. And the relationship is slowly dying.

The pattern is this: **he is systematically eliminating every form of tension from the relationship.** And in doing so, he is killing the spark.

Dr. Robert Glover, author of *No More Mr. Nice Guy*, identified this as one of the most destructive Nice Guy behaviors. Nice Guys believe that a good relationship should be smooth, frictionless, and free of discomfort. They treat tension like a fire alarm: something that signals danger and must be silenced immediately.

But tension is not a fire alarm. **Tension is the electricity that keeps a relationship alive.**

### What Is Positive Emotional Tension?

Before we go further, we need to separate two very different things.

**Negative tension** is what comes from dishonesty, manipulation, drama, volatility, and cruelty. Walking on eggshells. Silent treatments. Explosive arguments. That kind of tension erodes trust and creates fear. Nobody should tolerate it.

**Positive emotional tension** is something entirely different. It is the natural charge that exists between two people who are genuinely different, who hold their own ground, who have their own lives, and who choose each other from desire rather than dependency. It is the spark of polarity. The pull of mystery. The electricity of two separate people who are drawn together precisely because they are not the same.

Dr. Glover teaches that Nice Guys cannot tell the difference. To them, all tension feels dangerous. All friction feels like the beginning of the end. So they collapse it. Every time.

### How Nice Guys Collapse Tension

The ways Nice Guys eliminate tension are so habitual they do not even notice them. Here are the most common:

**Agreeing when you disagree.** She states an opinion. You have a different one. But instead of saying so, you nod along. You mirror her position. You swallow your actual thought because expressing it might create friction. The message you send: "I have no perspective of my own."

**Never having your own plans.** Your schedule revolves around hers. You are always available. You never say, "I can not tonight, I have plans." Because having your own plans means she might feel excluded, and her exclusion might create tension you cannot tolerate.

**Texting back instantly every time.** Not because you are genuinely excited, but because a gap in communication feels like a gap in the relationship. The silence is unbearable. You fill it immediately.

**Never saying no.** She asks for something. You say yes. She asks for something else. You say yes again. Not because you want to, but because saying no would create displeasure, and her displeasure is your emergency.

**Over-apologizing.** Something goes wrong, and you apologize before you even know whether it was your fault. You apologize for the weather, for the traffic, for things that have nothing to do with you. Because an apology is a tension-collapse tool: it signals submission and invites the other person to stop being upset.

**Avoiding all conflict.** You stuff your needs, bite your tongue, and swallow resentment rather than risk a difficult conversation. You tell yourself you are keeping the peace. What you are actually doing is keeping the distance.

### Why This Kills Attraction

Here is the paradox Dr. Glover identified: **the harder a Nice Guy works to keep things smooth, the faster attraction dies.**

Attraction requires polarity. Polarity requires difference. Difference creates tension. When you eliminate all tension, you eliminate the very thing that creates desire.

Think about it from her perspective. She is in a relationship with a man who never disagrees, never has his own plans, never pushes back, never creates any friction whatsoever. What is there to be attracted to? There is no edge. No mystery. No challenge. No sense that this man has a life, a backbone, or a self that exists independently of her.

She cannot miss you because you are always there. She cannot respect your boundaries because you do not have any. She cannot feel the pull of polarity because you have flattened everything into sameness.

This is not a character flaw on her part. It is basic relational physics. **Two magnets with the same charge repel. Two magnets with different charges attract.** When you eliminate every difference between you and her, you eliminate the charge.

### Where This Pattern Comes From

Dr. Glover traces this directly back to childhood. Nice Guys learned early that tension in the home was dangerous. Maybe a parent was volatile. Maybe conflict meant withdrawal of love. Maybe the household was so fragile that the child learned to monitor every emotional signal and adjust his behavior to keep things calm.

That child developed a survival strategy: **if I eliminate all tension, I will be safe.** And that strategy worked in a home where tension genuinely was dangerous.

But he is no longer a child. And a romantic relationship is not a volatile household. The rules are different. The strategy that kept him safe at eight years old is destroying his relationships at thirty-five.

The work is not about creating drama or manufacturing conflict. The work is about recognizing that **positive tension is not a threat.** It is the lifeblood of attraction, respect, and desire. And learning to let it exist instead of reflexively collapsing it is one of the most important skills a recovering Nice Guy can develop.

We will cover exactly how to do that in the next two lessons.

---

## Quick-Reference Outline

- Nice Guys systematically eliminate all tension from relationships, believing smooth equals safe.
- Positive emotional tension is the natural charge between two different people who hold their own ground. It creates polarity and attraction.
- Negative tension comes from dishonesty, manipulation, and cruelty. Positive tension comes from healthy difference.
- Common tension-collapsing behaviors: agreeing when you disagree, never having your own plans, instant texting, never saying no, over-apologizing, avoiding all conflict.
- Eliminating tension eliminates polarity, which eliminates attraction. Two same-charge magnets repel.
- Dr. Robert Glover traces this pattern to childhood survival strategies around dangerous household tension.
- The work is not creating drama. It is learning to let healthy tension exist instead of reflexively collapsing it.$$,
  ARRAY[
    'List three specific moments in the past week where you collapsed tension to keep things smooth. What did you actually want to say or do in each moment?',
    'Dr. Glover teaches that Nice Guys learned to fear tension in childhood. What was tension like in your home growing up? How did you learn to manage it, and how does that strategy show up in your adult relationships?',
    'Identify one relationship behavior where you are always available, always agreeable, or always apologetic. What would it look like to stop doing that for one week? Write down what you fear would happen.'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: The Power of Holding Tension
INSERT INTO lessons (id, chapter_id, title, description, sort_order, duration_seconds, video_source_type, video_url, is_preview, content, journal_prompts) VALUES (
  '20000000-0000-0000-0000-000000000227',
  '10000000-0000-0000-0000-000000000022',
  'The Power of Holding Tension',
  'Learn to sit with discomfort instead of collapsing or escalating, and discover how holding tension creates growth, trust, and deeper connection.',
  1,
  2160,
  'youtube',
  'https://www.youtube.com/watch?v=rb1CbqHaolM',
  false,
  $$## Full Script

In the last lesson we identified the problem: Nice Guys reflexively collapse tension. Now the question is, what do you do instead?

The answer is deceptively simple and profoundly difficult: **you hold it.**

Holding tension does not mean creating conflict. It does not mean being antagonistic, cold, or deliberately provocative. It means allowing natural emotional tension to exist without rushing to eliminate it. It means tolerating discomfort long enough for something real to happen underneath it.

Dr. Robert Glover describes this as one of the defining characteristics of an integrated man. The Nice Guy runs from tension. The aggressive man escalates it. The integrated man **holds it**. He lets it be there. He breathes through it. He does not need it to resolve on his timeline.

### Why Tension Feels Dangerous

To understand why holding tension is so hard for Nice Guys, you need to understand what is happening in your body when tension shows up.

When you sense relational tension, whether it is a disagreement, her displeasure, an unresolved conversation, or even just silence that feels loaded, your nervous system interprets it as a threat. Cortisol rises. Your chest tightens. Your stomach drops. Your mind starts racing with stories: "She is mad." "I did something wrong." "This is going to turn into a fight." "She is going to leave."

Those sensations and stories create an overwhelming urge to **do something**. Fix it. Apologize. Explain. Reach for her. Fill the silence. Anything to make the discomfort stop.

That urge is not rational. It is somatic. It lives in your body before your thinking brain even gets involved. And if you obey it every time, you will spend your entire relationship in a cycle of tension collapse and temporary relief that never actually builds anything lasting.

### What Holding Tension Actually Looks Like

Holding tension is a practice. It has specific, concrete behaviors.

**1. Pause before you respond.**

When tension shows up, your first impulse will be to react. Do not. Take a breath. Feel your feet on the floor. Let five seconds pass. Those five seconds are the difference between a reaction and a response. A reaction is your nervous system on autopilot. A response is a conscious choice.

**2. Tolerate her displeasure without fixing it.**

She is upset. She is quiet. She gave you a look. Your entire body screams: fix it, apologize, make it better. Instead, let her have her experience. You do not need to manage her emotions for her. Her displeasure is not your emergency.

This does not mean being dismissive. You can say, "I can see something is bothering you. I am here when you want to talk about it." That is warm, present, and boundaried. What you do not do is chase her around the house trying to extract reassurance that everything is okay.

**3. Say what you actually think.**

When she asks your opinion, give it. When you disagree, say so respectfully. When you have a preference, state it. This creates tension. That is the point. A man who has his own perspective is a man with substance. She may push back. She may not like it. That is okay. The tension of honest disagreement is infinitely healthier than the slow rot of silent compliance.

**4. Let silence exist.**

Not every pause needs to be filled. Not every text needs an immediate reply. Not every quiet moment needs to be narrated. Silence is not abandonment. Silence is space. And space is where attraction breathes.

**5. Do not rush resolution.**

After a disagreement, your instinct will be to wrap it up neatly as fast as possible. "Are we okay? Can we move on? I am sorry, can we just be done with this?" That rush is not about resolution. It is about your anxiety. Let the conversation end when it naturally ends, even if that means sitting with unresolved tension for a few hours. Most things do not need to be resolved in one sitting.

### The Difference Between Holding and Escalating

This is a critical distinction. Holding tension is not the same as creating it.

**Holding** says: "There is tension here. I am going to let it exist without running from it or making it worse."

**Escalating** says: "There is tension here. I am going to push harder, provoke more, or withdraw aggressively to prove I do not care."

Some men read about tension and start manufacturing conflict. They become deliberately provocative, withhold affection as a power play, or use silence as punishment. That is not holding tension. That is weaponizing it.

Dr. Glover is clear on this: **the goal is not to create tension. The goal is to stop collapsing the tension that naturally arises in any real relationship.** You do not need to go looking for it. If you are being honest, setting boundaries, and living your own life, tension will show up on its own. Your job is simply to let it be there.

### What Happens When You Hold

When you develop the ability to hold tension, several things shift in your relationships.

**Trust deepens.** She learns that you can handle discomfort without falling apart. That makes her feel safer bringing difficult things to you, because she knows you will not crumble or flee.

**Attraction increases.** A man who can hold his ground under pressure is a man with substance. She can feel the difference between a man who stays calm because he is grounded and a man who stays quiet because he is afraid.

**Conflict becomes productive.** When neither person is rushing to collapse the tension, the real issue underneath can actually surface. Most couples fight about the wrong thing because they are both too anxious to sit with the discomfort long enough to find the real thing.

**You grow.** Every time you hold tension instead of collapsing it, you expand your capacity. Dr. Glover calls this building your **emotional muscles**. Just like physical muscles, they grow under resistance, not comfort. The tension you are afraid of is the very thing that makes you stronger.

This is not comfortable work. It is not supposed to be. But it is the work that transforms a Nice Guy from a man who performs safety into a man who actually provides it.

---

## Quick-Reference Outline

- Holding tension means allowing natural emotional discomfort to exist without rushing to eliminate it.
- The Nice Guy collapses tension. The aggressive man escalates it. The integrated man holds it.
- Tension feels dangerous because your nervous system reads it as a threat and floods you with the urge to fix, apologize, or flee.
- Holding looks like: pausing before responding, tolerating her displeasure, saying what you think, letting silence exist, not rushing resolution.
- Holding is not escalating. Do not manufacture conflict or weaponize silence. Let natural tension exist.
- When you hold tension: trust deepens, attraction increases, conflict becomes productive, and your emotional capacity grows.
- Dr. Robert Glover: emotional muscles grow under resistance, not comfort.$$,
  ARRAY[
    'Think of a recent moment where you felt the urge to fix, apologize, or fill a silence. Describe the physical sensations in your body. Where did you feel the tension? What story did your mind tell you?',
    'Pick one of the five holding practices from this lesson. Commit to using it for the next three days. Write down which one you chose and what specific situation you plan to use it in.',
    'Dr. Glover says emotional muscles grow under resistance. Describe one area of your relationship where you have been avoiding resistance. What would it look like to hold the tension there instead of collapsing it?'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Creating Healthy Polarity
INSERT INTO lessons (id, chapter_id, title, description, sort_order, duration_seconds, video_source_type, video_url, is_preview, content, journal_prompts) VALUES (
  '20000000-0000-0000-0000-000000000228',
  '10000000-0000-0000-0000-000000000022',
  'Creating Healthy Polarity',
  'Practical daily behaviors that maintain positive tension and create lasting attraction through differentiated, intentional living.',
  2,
  2220,
  'youtube',
  'https://www.youtube.com/watch?v=rb1CbqHaolM',
  false,
  $$## Full Script

You understand why Nice Guys kill the spark. You know how to hold tension instead of collapsing it. Now the question is: **what does a life look like that naturally generates positive emotional tension?**

Because tension is not something you perform. It is not a technique you apply in the moment. It is the byproduct of how you live. A man who has his own life, his own standards, his own mission, and his own backbone will create positive tension without trying. A man who has none of those things will collapse tension no matter how many scripts he memorizes.

Dr. Robert Glover puts it this way: **a Nice Guy tries to be what she wants. An integrated man becomes who he is.** The first strategy kills polarity. The second creates it.

This lesson is about the daily, practical behaviors that create healthy polarity in a relationship. These are not tricks. They are ways of living.

### 1. Have Your Own Life

This sounds obvious. It is not.

Most Nice Guys in relationships gradually abandon their own interests, friendships, hobbies, and goals. They do not do it all at once. It happens slowly. He stops going to the gym because she prefers they spend evenings together. He stops seeing his friends because she feels left out. He stops pursuing his projects because they take time away from her.

Within a year, his entire life revolves around her. And he wonders why the attraction is gone.

Dr. Glover teaches that **a man with his own life is inherently more attractive than a man whose life is his partner.** Not because she wants to be neglected, but because a man with his own world has substance, depth, and edges. She can miss him. She can wonder what he is doing. She can feel the pull of someone who exists independently of her.

This means:
- Keep your friendships alive and prioritize them, even when it is inconvenient.
- Maintain hobbies and interests that have nothing to do with her.
- Have goals and projects that you work on consistently.
- Spend time alone without treating it as a problem to be solved.

You are not doing this to manipulate her into wanting you more. You are doing it because a full life is the foundation of a full man.

### 2. Set Boundaries Without Apology

Boundaries are one of the most powerful polarity-creating tools available to you, and Nice Guys almost never use them.

A boundary says: "This is where I end and you begin. I respect your autonomy, and I ask you to respect mine." That creates differentiation. Differentiation creates polarity. Polarity creates attraction.

Dr. Glover notes that Nice Guys avoid boundaries because they fear the tension that comes with them. She might be disappointed. She might push back. She might be upset. All of those responses are forms of tension, and the Nice Guy would rather abandon his boundary than sit with the discomfort.

But every time you set a boundary and hold it, you communicate something powerful: "I am a man with limits. I know what I will and will not accept. My stability does not depend on your approval."

That is deeply attractive. Not because women want a controlling man, but because a man who knows his own limits is a man who can be trusted.

Setting boundaries sounds like:
- "I am not okay with that. Here is what I need instead."
- "I love you, and I need tonight for myself."
- "I hear your frustration, and I am not going to change my position on this."

No aggression. No guilt. No lengthy justification. Just clarity.

### 3. Be Direct Instead of Indirect

Nice Guys are masters of indirect communication. They hint. They imply. They say yes when they mean no. They say "whatever you want" when they have a strong preference. They use silence, withdrawal, or passive-aggression to communicate displeasure instead of stating it plainly.

All of this collapses tension. Indirect communication is a safety strategy: if I never state my position clearly, I can never be rejected for it.

But direct communication creates healthy tension. When you say what you mean, you give her something to respond to. You create a real conversation between two real people instead of a performance between a shapeshifter and a mind reader.

Dr. Glover calls this **living from the center.** Instead of calculating what she wants to hear and delivering it, you speak from your actual experience.

That looks like:
- "I would rather do this instead." (Instead of "Whatever you want.")
- "That bothered me." (Instead of withdrawing and hoping she notices.)
- "No, I can not do that." (Instead of saying yes and resenting it later.)
- "I want you." (Instead of waiting for her to initiate and feeling rejected when she does not.)

Directness is not aggression. It is honesty delivered with respect. And it creates the kind of tension that keeps a relationship electrically alive.

### 4. Be Willing to Disappoint

This may be the hardest one for recovering Nice Guys. Dr. Glover identifies the fear of disappointing others as the core engine of Nice Guy behavior. Everything flows from it: the people-pleasing, the conflict avoidance, the shapeshifting, the covert contracts.

But here is the truth: **you cannot create polarity if you are unwilling to disappoint.** Because polarity requires that you sometimes want different things. That you sometimes say no. That you sometimes prioritize your needs over her comfort.

A man who is willing to disappoint is a man who has chosen his own integrity over her approval. That does not mean he is careless with her feelings. It means he does not sacrifice his truth to manage them.

She asks you to cancel your plans. You do not want to. The Nice Guy cancels and stuffs his resentment. The integrated man says, "I am going to keep my plans tonight. Let's do something together tomorrow."

She is upset about something that is not your fault. The Nice Guy apologizes anyway. The integrated man says, "I can see you are upset, and I understand. I am not going to apologize for something I did not do."

Every act of willing disappointment creates polarity. It says, "I am here. I love you. And I am still me."

### 5. Stop Managing Her Emotions

Nice Guys are emotional managers. They scan her mood, anticipate her needs, adjust their behavior to keep her emotional state in a range that feels safe to them. This is not love. This is control disguised as care.

When you stop managing her emotions, you create space for her to have her own experience. She can be upset without you scrambling to fix it. She can be disappointed without you collapsing into guilt. She can be angry without you either defending or submitting.

Dr. Glover teaches that **a woman's emotions are her own.** You can be present for them. You can be compassionate. But you do not own them, and you do not need to fix them.

When you stop managing, two things happen. First, she starts to trust you more, because she can feel that you are not performing. Second, natural polarity returns, because two people who manage their own emotional states create the kind of differentiation that attraction runs on.

### The Bigger Picture

All five of these behaviors point to the same thing: **living as a whole, differentiated man.** A man who has his own life, his own boundaries, his own voice, his own willingness to disappoint, and his own emotional sovereignty.

That man does not need techniques to create attraction. His way of living is the technique. The positive tension he generates is not manufactured. It is the natural result of two separate people choosing each other from desire, not dependency.

Dr. Glover writes that the integrated man does not try to be what she wants. He focuses on becoming who he actually is. And paradoxically, who he actually is turns out to be far more attractive than the performance he was putting on.

That is the power of healthy polarity. Not drama. Not games. Just a real man, living a real life, and letting the spark take care of itself.

---

## Quick-Reference Outline

- Positive tension is not a technique. It is the byproduct of how you live as a differentiated man.
- Have your own life: friendships, hobbies, goals, and time alone that exist independently of the relationship.
- Set boundaries without apology: clarity about your limits communicates strength and trustworthiness.
- Be direct: say what you mean, state your preferences, and stop using silence and hinting as communication strategies.
- Be willing to disappoint: choosing your integrity over her approval is the core shift from Nice Guy to integrated man.
- Stop managing her emotions: her feelings are hers. Be present for them without owning or fixing them.
- Dr. Robert Glover: the integrated man does not try to be what she wants. He becomes who he actually is, and that creates lasting attraction.$$,
  ARRAY[
    'Rate yourself from 1 to 10 on each of the five polarity-creating behaviors in this lesson. For your lowest-rated area, write down one specific change you will make this week.',
    'Dr. Glover says the fear of disappointing others is the core engine of Nice Guy behavior. Write about a recent time you chose her comfort over your truth. What would the integrated version of you have done differently?',
    'Describe what your life would look like if you fully committed to having your own interests, friendships, and goals outside the relationship. What have you let go of that you want to reclaim?'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Phase 4: Update Womanese course metadata
-- ============================================================

UPDATE courses
SET description = $$Do you ever feel like you and women are speaking two entirely different languages? That's because you are. "Womanese" doesn't run on pure logic; it runs on emotional subcommunication and safety testing. In this course, we decode the specific phrases men misunderstand—like "I'm fine," "You always," and "Whatever"—and show you how to respond calmly instead of getting triggered. We also break down exactly why women use "shit tests" and how they "poke the bear" when they actually want you to lead and initiate intimacy. Then we go deeper: you will learn Dr. Robert Glover's concept of positive emotional tension—the healthy polarity that Nice Guys unknowingly destroy—and the neuroscience of conflict with proven de-escalation techniques.$$,
    short_description = 'Decode subcommunication, testing dynamics, intimacy cues, positive emotional tension, and conflict de-escalation while staying calm and grounded.',
    topics = ARRAY['Communication', 'Relationship Skills', 'Dating Dynamics', 'Shit Tests', 'Emotional Regulation', 'Masculine Leadership', 'Intimacy', 'Positive Emotional Tension', 'Polarity', 'Conflict De-escalation', 'Nervous System Regulation'],
    what_you_will_learn = ARRAY['Translate emotionally loaded phrases without arguing the facts', 'Identify compliance, congruence, and fitness tests in real time', 'Stay calm and grounded under pressure instead of getting reactive', 'Distinguish friction from flirtation without forcing the moment', 'Lead clearly while respecting reciprocity and consent', 'Understand positive emotional tension and stop killing the spark by collapsing polarity', 'De-escalate conflict using physiological regulation and repair techniques']
WHERE id = '00000000-0000-0000-0000-000000000010';

-- ============================================================
-- Phase 5: Update Relationship Frame Workshop course metadata
-- ============================================================

UPDATE courses
SET description = $$Your relationship frame determines the quality of every romantic relationship you'll have. This workshop teaches you how to establish and maintain a healthy relationship frame based on standards, not scarcity. Starting with the foundational skill of differentiation over enmeshment, you'll learn to attract from abundance, lead with integrity, and build partnerships where both people thrive.$$,
    short_description = 'Establish a healthy relationship frame through differentiation, standards, and authentic masculine leadership.',
    topics = ARRAY['Relationship Frame', 'Dating Standards', 'Attraction', 'Partnership', 'Masculine Leadership', 'Differentiation', 'Enmeshment'],
    what_you_will_learn = ARRAY['Break the enmeshment pattern and build differentiated, lasting attraction', 'Define your non-negotiable relationship standards', 'Stop dating from scarcity and desperation', 'Build attraction through authenticity, not performance', 'Lead in relationships without being controlling', 'Create partnerships where both people grow']
WHERE id = '00000000-0000-0000-0000-000000000006';
