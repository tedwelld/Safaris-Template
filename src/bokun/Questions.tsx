import type { Question, QuestionGroup } from './api';
export type Values = Record<string, string[]>;
export function Questions({ questions = [], path, values, change }: { questions?: Question[]; path: string; values: Values; change: (key: string, value: string[]) => void }) {
  return questions.map(q => {
    const key = `${path}.${q.questionId}`;
    const value = values[key] || q.answers || (q.defaultValue ? [q.defaultValue] : []);
    const type = q.dataFormat === 'EMAIL_ADDRESS' ? 'email' : q.dataFormat === 'PHONE_NUMBER' ? 'tel' : q.dataType === 'DATE' ? 'date' : q.dataType === 'DATE_AND_TIME' ? 'datetime-local' : ['NUMBER', 'INTEGER', 'INT', 'DOUBLE'].includes(q.dataType || '') ? 'number' : 'text';
    if (q.dataType === 'LONG_TEXT') return <label className="bk-question" key={key}>{q.label}{q.required && ' *'}<textarea required={q.required} placeholder={q.placeholder} value={value[0] || ''} onChange={e => change(key, [e.target.value])} />{q.help && <small>{q.help}</small>}</label>;
    if (q.dataType === 'CHECKBOX_TOGGLE') return <label className="bk-consent" key={key}><input type="checkbox" required={q.required} checked={value[0] === 'true'} onChange={e => change(key, [String(e.target.checked)])} /><span>{q.label}{q.required && ' *'}{q.help && <small>{q.help}</small>}</span></label>;
    return <label className="bk-question" key={key}>{q.label}{q.required && ' *'}{q.selectFromOptions ? <select required={q.required} multiple={q.selectMultiple} value={q.selectMultiple ? value : value[0] || ''} onChange={e => change(key, Array.from(e.target.selectedOptions, o => o.value))}>{!q.selectMultiple && <option value="">Please select</option>}{q.answerOptions?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : q.dataType === 'BOOLEAN' ? <select required={q.required} value={value[0] || ''} onChange={e => change(key, [e.target.value])}><option value="">Please select</option><option value="true">Yes</option><option value="false">No</option></select> : <input required={q.required} type={type} step={type === 'number' ? 'any' : undefined} pattern={q.dataFormat === 'PATTERN' ? q.pattern : undefined} placeholder={q.placeholder} value={value[0] || ''} onChange={e => change(key, [e.target.value])} />}{q.help && <small>{q.help}</small>}</label>;
  });
}
const fields = ['mainContactDetails', 'passengerDetails', 'questions', 'pickupQuestions', 'dropoffQuestions'] as const;
const children = ['activityBookings', 'passengers', 'extras'] as const;
export function QuestionTree({ group, path = 'booking', values, change }: { group: QuestionGroup; path?: string; values: Values; change: (key: string, value: string[]) => void }) {
  return <>{fields.map(field => <Questions key={field} questions={group[field]} path={`${path}.${field}`} values={values} change={change} />)}{children.map(field => group[field]?.map((child, i) => <fieldset className="bk-question-group" key={`${field}-${i}`}><legend>{child.activityTitle || (field === 'passengers' ? `Guest ${i + 1} · ${child.pricingCategoryTitle || ''}` : 'Additional details')}</legend><QuestionTree group={child} path={`${path}.${field}.${i}`} values={values} change={change} /></fieldset>))}</>;
}
export function answers(questions: Question[] = [], path: string, values: Values) {
  return questions.map(q => ({ questionId: q.questionId, values: values[`${path}.${q.questionId}`] || q.answers || (q.defaultValue ? [q.defaultValue] : []) }));
}
export function answerTree(group: QuestionGroup, values: Values, path = 'booking'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of ['bookingId', 'activityId', 'pricingCategoryId'] as const) if (group[key] !== undefined) result[key] = group[key];
  for (const field of fields) if (group[field]) {
    const target = field === 'questions' ? 'answers' : field === 'pickupQuestions' ? 'pickupAnswers' : field === 'dropoffQuestions' ? 'dropoffAnswers' : field;
    result[target] = answers(group[field], `${path}.${field}`, values);
  }
  for (const field of children) if (group[field]) result[field] = group[field].map((child, i) => answerTree(child, values, `${path}.${field}.${i}`));
  return result;
}
