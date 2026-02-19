/**
 * RAG Document Store for MindEase
 * 
 * Contains the DSM-5-TR–aligned knowledge base extracted from the documents table.
 * These documents are injected as context into the LLM system prompt to enable
 * Retrieval-Augmented Generation (RAG) without requiring server-side embeddings.
 * 
 * Source: documents_rows.sql (pre-computed from Supabase documents table)
 */

const RAG_DOCUMENTS: string[] = [
  // Document 1: DSM-5-TR Dataset Construction Overview
  `DSM-5-TR–Aligned Dataset Construction for Retrieval-Augmented Generation (RAG)

1. Overview of Dataset Purpose
This section presents the design and structure of the dataset used for the Retrieval-Augmented Generation (RAG) framework in the MindEase chatbot. The dataset is conceptually derived from the Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR) and is tailored to support individuals experiencing low to mild depressive symptoms. The dataset does not include verbatim DSM-5-TR diagnostic criteria and does not perform diagnosis. Instead, it provides ethically filtered, evidence-based knowledge to guide supportive, non-clinical chatbot interactions.

2. Comprehensive Coverage of DSM-5-TR Depressive Disorders
All depressive disorders defined in DSM-5-TR were reviewed during dataset development. Each disorder is either included for therapeutic support, or explicitly excluded with justification, ensuring ethical compliance and safety.

3. Depressive Disorders Included for Support (Mild Severity Only)

3.1 Major Depressive Disorder (Mild Episodes)
Major Depressive Disorder (MDD) in its mild form is characterized by the presence of depressive symptoms that cause emotional distress but do not significantly impair daily functioning. Individuals may continue to perform routine tasks while experiencing persistent low mood, reduced interest in activities, mild fatigue, or concentration difficulties.
Dataset Coverage: Emotional low mood, Reduced motivation, Mild anhedonia, Negative thought patterns, Mild sleep or appetite changes.
Chatbot Role: MindEase provides CBT-based coping strategies, behavioral activation, thought reframing, and psychoeducation. It does not diagnose MDD but supports users whose symptoms remain within a mild severity range.

3.2 Persistent Depressive Disorder (Dysthymia – Mild)
Persistent Depressive Disorder involves long-term low mood lasting two years or more, often accompanied by low energy, low self-esteem, and feelings of hopelessness. In mild cases, individuals maintain functional capacity despite emotional distress.
Dataset Coverage: Chronic low mood, Reduced energy, Negative self-concept, Emotional fatigue.
Chatbot Role: MindEase offers reflective dialogue, motivational techniques, and emotional regulation strategies, while encouraging professional consultation due to symptom chronicity.

4. Depressive Disorders Explicitly Excluded from Therapeutic Support
The following DSM-5-TR disorders are included as detection categories only, not supported therapeutically:
4.1 Major Depressive Disorder (Moderate to Severe) – requires professional clinical care.
4.2 Major Depressive Disorder with Suicidal Ideation – triggers immediate escalation.
4.3 Major Depressive Disorder with Psychotic Features – requires urgent psychiatric intervention.
4.4 Substance or Medication-Induced Depressive Disorder – requires medical assessment.
4.5 Depressive Disorder Due to Another Medical Condition – must be clinically evaluated.
4.6 Premenstrual Dysphoric Disorder (PMDD) – requires specialized care.
4.7 Disruptive Mood Dysregulation Disorder (DMDD) – outside adult mental health scope.
4.8 Other Specified Depressive Disorder – risk identification and referral triggers only.
4.9 Unspecified Depressive Disorder – referral triggers only.`,

  // Document 2: DSM-5-TR Symptom Coverage and Dataset Categories
  `5. DSM-5-TR Symptom Coverage in the Dataset

5.1 Symptoms Included for Support (Low Severity)
- Persistent sadness or low mood
- Loss of interest or pleasure
- Mild fatigue
- Mild sleep disturbances
- Minor appetite changes
- Difficulty concentrating
- Negative self-talk
- Mild psychomotor changes
These symptoms are phrased in conversational, non-clinical language for safe chatbot interaction.

5.2 Symptoms Included Only for Detection and Escalation
- Suicidal ideation
- Self-harm behavior
- Severe guilt or worthlessness
- Psychotic symptoms
- Severe functional impairment
- Crisis expressions
These symptoms immediately activate the chatbot's safety and referral protocol.

6. Dataset Categories for RAG Implementation
6.1 Depression Knowledge Base – General understanding of depression, severity distinctions, and emotional wellbeing concepts.
6.2 Symptom Interpretation Rules – Guidelines to interpret user language safely and determine severity.
6.3 CBT and Psychological Intervention Modules – Includes: Cognitive restructuring, Behavioral activation, Mindfulness, Emotional regulation, Self-compassion techniques.
6.4 Safety and Escalation Rules – Defines crisis language patterns and referral logic.
6.5 Exclusion Criteria Knowledge – Explains why certain conditions exceed chatbot capabilities.
6.6 Psychoeducation Content – Educational material on mood, stress, sleep, habits, and emotional health.
6.7 Chatbot Behavioral Guidelines – Defines ethical tone, empathy rules, and non-diagnostic communication.

8. Ethical Alignment and Safety Assurance
The dataset strictly follows DSM-5-TR ethical guidance by: Avoiding diagnosis or treatment claims, Supporting only mild depressive symptoms, Escalating high-risk cases immediately, Encouraging professional help when needed. MindEase operates as a low-intensity emotional support system, not a replacement for therapy or clinical services.`,

  // Document 3: DSM-5 Depressive Disorders Filtered for MindEase
  `DSM-5 DEPRESSIVE DISORDERS — FILTERED FOR MINDEASE CHATBOT USE
Your chatbot only deals with: Low to mild depressive symptoms, Low-intensity CBT, Self-help, early intervention, No diagnosis or medical judgement.

1. Disorders Relevant to MindEase (Low–Mild Depression)
These two DSM-5 categories apply to your scope:

Major Depressive Disorder — Mild episodes ONLY
DSM-5 defines mild depression as: Fewer symptoms (typically 5–6 symptoms from MDD list), Slight functional impairment, Still able to function in daily life, Low risk indicators. Your chatbot may screen for mild symptoms ONLY.

Persistent Depressive Disorder (Dysthymia) — Mild
Long-term low mood with mild symptoms, NOT disabling. Your chatbot can support: Low mood, Low energy, Mild hopelessness, Low motivation. If symptoms appear long-term (2 years) → chatbot informs user: "You may benefit from talking to a clinician."

2. Conditions EXCLUDED from MindEase Scope
These DSM-5 disorders MUST NOT be handled by the chatbot:
- Major Depressive Disorder – Moderate or Severe
- Any episode with suicidal ideation or self-harm
- Depressive Disorder with psychotic features
- Substance/Medication-Induced Depressive Disorder
- Depression due to a medical condition
- Disruptive Mood Dysregulation Disorder (children)
- Premenstrual Dysphoric Disorder
When detected → chatbot provides crisis/safety message + referral.

3. DSM-5 SYMPTOMS Your Chatbot Can Screen For (Allowed)
Core Symptoms: Feeling down, sad, or low; Loss of interest or pleasure.
Secondary Mild Symptoms: Low energy or fatigue; Mild sleep issues (not disruptive); Mild appetite changes; Mild concentration difficulty; Feeling "not good enough" or having negative thoughts; Feeling slowed down or more restless than usual.
Your chatbot should phrase these in simple conversational non-clinical language.

4. DSM-5 Symptoms the Chatbot MUST NOT engage with
If detected → stop conversation, display safety notice, provide referral.
- Suicidal thoughts or self-harm
- Intent, plan, or hopelessness statements
- Hallucinations or delusional thinking
- Severe appetite or sleep change
- Non-functionality ("I can't do anything anymore")
- Substance dependence mentions
- Crisis language ("I want to disappear")
These are automatic escalation triggers.

5. DSM-5-Aligned Risk Detection Phrases for Chatbot Safety
Suicidal Ideation Keywords: "I want to end things", "There's no point anymore", "I want to disappear", "I can't keep going"
Bot response pattern: Stop CBT, Provide crisis resources, Recommend urgent professional help, Do NOT continue conversation.

6. DSM-5 Low-Mild Severity Criteria (What MindEase CAN Support)
Low to Mild Depression includes: Persistent sadness, Mild anhedonia, Mild sleep issues, Mild fatigue, Negative thoughts, Occasional hopelessness (NOT suicidal), Slight difficulty in concentration, Still functioning in daily life, Symptoms present for ≥ 2 weeks.
MindEase CAN handle these with: CBT thought reframing, Behavioral activation (small tasks), Sleep hygiene tips, Mindfulness micro-interventions.

7. Moderate/Severe Criteria (What MindEase CANNOT Support)
If detected, chatbot MUST refer out. Indicators: Not functioning at work/school, Unable to get out of bed, Severe appetite/sleep change, Intense guilt or worthlessness, Suicidal thoughts, Aggression or self-harm, Psychomotor retardation or agitation, Severe cognitive impairment. These require clinical assessment.`,

  // Document 4: DSM-5 Framework, Methodology, Safety Boundary Protocol
  `1. DSM-5 Framework for Understanding Depression (For Mild–Low Symptoms)
The Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5), categorizes depressive disorders based on severity, duration, and functional impairment. MindEase focuses strictly on the mild to low end of the depressive spectrum, intentionally excluding all moderate to severe conditions due to ethical and clinical safety boundaries.

DSM-5 identifies the following depressive disorders relevant to early-stage, non-crisis emotional support:
- Major Depressive Disorder — Mild Episodes: individuals experience low mood, reduced pleasure, mild fatigue, and minor concentration difficulties, but daily functioning remains largely intact.
- Persistent Depressive Disorder (Dysthymia) — Mild: characterized by low mood, reduced energy, and low motivation, without severe symptoms or functional collapse.

MindEase does not diagnose users. It uses these DSM-5 categories as a conceptual framework to identify when symptoms appear mild and appropriate for self-help, and when they exceed the chatbot's scope.

2. DSM-5-Aligned Symptom Screening Methodology
MindEase incorporates DSM-5-guided symptom screening to differentiate between:
- Users appropriate for low-intensity CBT support
- Users requiring professional intervention

The chatbot uses simplified, conversational versions of DSM-5 depressive symptoms including: Low mood, Reduced interest, Mild sleep disturbance, Low energy, Mild concentration difficulty, Negative self-evaluation.

DSM-5 Symptoms Excluded From Chatbot Support: Suicidal ideation, Self-harm thoughts or behaviors, Severe appetite or sleep changes, Psychotic features, Substance-induced symptoms, Severe functional impairment, Crisis language such as "I want to end everything," "I can't continue," or "I want to disappear." When detected, MindEase triggers the Ethical Safety Protocol.

3. Ethical DSM-5 Safety Boundary Protocol
Allowed Support (Low-Intensity): Mild depressive symptoms, Low mood, Brief sadness, Mild anhedonia, Situational stress, Mild fatigue, Sleep issues, Cognitive distortions, Anxiety overlap.
Methods: CBT-based thought reframing, Behavioral activation, Journaling, Mindfulness, Structured self-help tasks.

Not Allowed (Referral Required): Suicidal thoughts, Self-harm intentions, Severe hopelessness, Psychotic symptoms, Severe functional impairment, Crisis language, Active trauma responses, Substance-induced mood issues, Medical condition-induced mood issues.
If detected, MindEase follows the three-step escalation protocol: Stop conversation immediately, Provide empathetic safety message, Offer crisis resources and encourage immediate human help.`,

  // Document 5: DSM-5-Based Chatbot Decision Flow and PHQ Screening
  `DSM-5-Based Chatbot Decision Flow

Step 1 — Initial Screening (PHQ-2 Style)
"low mood" OR "loss of interest" → proceed
If neither → general emotional wellbeing support

Step 2 — Mild Symptom Check
Check for: Mild fatigue, Mild sleep issues, Mild appetite changes, Mild concentration issues, Negative thoughts.
If symptoms appear mild → chatbot continues with CBT-based support.

Step 3 — Red Flag Detection (Severe Symptoms)
Look for: "I don't want to live", "I want to disappear", "I want to end things", Severe sleep/appetite issues, Hallucinations, Unable to function.
If detected → trigger Safety Protocol.

Step 4 — Safety Protocol
Stop therapeutic conversation, Provide crisis information, Recommend urgent professional support, Do not re-engage on crisis themes.

Step 5 — Low-Intensity Support Pathway
If user safe → chatbot provides: CBT thought restructuring, Behavioral activation, Journaling and reflection, Mindfulness micro-exercises, Mood tracking, Encouraging statements, Psychoeducation.

PHQ-Style Screening Questions (Mild Depression Only)
PHQ-2 (Starter Questions):
- "How often have you felt down, low, or depressed this past week?"
- "How often have you lost interest in things you normally enjoy?"
If user answers "often" → proceed to mild-symptom screen.

Mild Symptom Assessment (Adapted from DSM-5):
- "How has your energy level been lately?"
- "Have you noticed any small changes in your sleep?"
- "Have you been finding it harder to focus than usual?"
- "Do you feel more critical of yourself recently?"
- "Do you find tasks require more effort than they used to?"

Safety Check (Soft Wording; Non-triggering):
- "Have you been feeling so overwhelmed that you've thought about harming yourself?"
- "Are you currently safe?"
If user indicates risk → Safety Protocol.`,

  // Document 6: PHQ Screening and Safety Protocol for Chatbot
  `DSM-5 Compatible Screening for Chatbot (PHQ-Style)
Your chatbot can ethically use these simplified DSM-based questions:

PHQ-2 Style Initial Screen:
- "How often have you felt down or hopeless recently?"
- "How often have you lost interest in things you usually enjoy?"
If score suggests more than mild → referral.

Optional Additional Questions:
- "How is your energy level?"
- "How are you sleeping lately?"
- "Have you been worrying more than usual?"
- "Do you feel overloaded or not good enough?"

DSM-5-Compatible Safety Protocol for MindEase
When to Escalate to Safety Message — If user expresses: intent, plan, hopelessness with risk, self-harm history, severe symptoms, crisis terms.

Crisis Message Example:
"It sounds like you may be going through something very overwhelming. I'm not able to help during crises, but I want you to get support immediately. Here are resources that can help right now:
- Emergency: Call 911 or go to your nearest emergency room
- 988 Suicide & Crisis Lifeline: Call or text 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/"`,
];

/**
 * Returns the full RAG knowledge base as a single string,
 * with documents separated by dividers.
 * This is injected into the LLM system prompt to provide
 * DSM-5-TR–aligned context for every response.
 */
export function getRagContext(): string {
  return RAG_DOCUMENTS.join('\n\n---\n\n');
}
