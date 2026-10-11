export type Subscription = { kind: 'city' | 'field' | 'organization'; value: string };

const canonicalTopic = (value = '') => {
  const normalized = value.toLocaleLowerCase('sq').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (['tech', 'technology', 'teknologji', 'teknologjia', 'it', 'informatike'].includes(normalized)) return 'teknologji';
  return normalized;
};

export const topicMatches = (member: any, topic: Subscription, tags: string[] = []) => {
  const wanted = canonicalTopic(topic.value);
  if (tags.some(tag => canonicalTopic(tag) === wanted)) return true;
  if (topic.kind === 'city') return canonicalTopic(member?.city) === wanted;
  return (member?.fieldsOfExpertise || []).some((field: string) => canonicalTopic(field) === wanted);
};

export const addSelectOptions = (select: HTMLSelectElement, values: string[]) => {
  values.forEach(value => select.add(new Option(value, value)));
};
