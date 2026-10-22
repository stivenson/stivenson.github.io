import { describe, expect, it } from 'vitest';
import reference from './svm-reference.json';
import { SVM_POINTS } from './datasets';
import { marginWidth, supportVectors, svmDecision, trainSvm, type Kernel } from './ovaMath';

describe('SVM: C, kernel y gamma frente a scikit-learn 1.6.1', () => {
  it.each(reference.cases)('$kernel C=$C gamma=$gamma', (item) => {
    const kernel: Kernel = item.kernel === 'linear' ? { kind: 'linear' } : { kind: 'rbf', gamma: item.gamma };
    const model = trainSvm(SVM_POINTS, item.C, kernel);
    reference.queries.forEach(([x, y], i) => expect(svmDecision(model, { x, y })).toBeCloseTo(item.decisions[i], 2));
    reference.queries.forEach(([x, y], i) => expect(Math.sign(svmDecision(model, { x, y }))).toBe(Math.sign(item.decisions[i])));
    expect(supportVectors(model)).toEqual(item.support);
    if (item.margin !== null) expect(marginWidth(model)).toBeCloseTo(item.margin, 2);
  });
});
