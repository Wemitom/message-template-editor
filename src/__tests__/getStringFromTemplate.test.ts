import { Input } from '../components/Editor/types';
import { getStringFromTemplate } from '../utils/functions';

describe('getStringFromTemplate', () => {
  it('should generate the string from a simple text template', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello, {name1}!',
      uid: '1234'
    };

    const values: Record<string, string> = {
      name1: 'world'
    };

    const result = getStringFromTemplate(template, values);

    expect(result).toEqual('Hello, world!');
  });

  it('should generate the string from a template with if-then-else branches', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello {name1}! How is your {name2}? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{name3}',
          uid: '5678-1',
          children: [
            {
              type: 'then',
              value: 'This is the true branch. ',
              uid: '5678-1-1'
            },
            {
              type: 'else',
              value: 'This is the false branch. ',
              uid: '5678-1-2'
            }
          ]
        },
        {
          type: 'normal',
          value: 'Best Regards, John',
          uid: '1234'
        }
      ]
    };

    const valuesTrue: Record<string, string> = {
      name1: 'Tom',
      name2: 'day',
      name3: 'var'
    };
    const resultTrue = getStringFromTemplate(template, valuesTrue);
    expect(resultTrue).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const values2: Record<string, string> = {
      name1: 'Alice',
      name2: 'evening',
      name3: ''
    };
    const result2 = getStringFromTemplate(template, values2);
    expect(result2).toEqual(
      'Hello Alice! How is your evening? This is the false branch. Best Regards, John'
    );
  });

  it('should generate the string from a template with nested if-then-else branches', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello, {name1}! How are you today? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{name2}',
          uid: '5678-1',
          children: [
            {
              type: 'then',
              value: 'This is the true branch 1. ',
              uid: '5678-1-1',
              children: [
                {
                  type: 'if',
                  value: '{name3}',
                  uid: '5678-1-1-1',
                  children: [
                    {
                      type: 'then',
                      value: 'Nested true branch. ',
                      uid: '5678-1-1-1-1'
                    },
                    {
                      type: 'else',
                      value: 'Nested false branch. ',
                      uid: '5678-1-1-1-2'
                    }
                  ]
                },
                {
                  type: 'then',
                  value: 'This is the true branch 2. ',
                  uid: '5678-1-2'
                }
              ]
            },
            {
              type: 'else',
              value: 'This is the false branch. ',
              uid: '5678-2'
            }
          ]
        },
        {
          type: 'normal',
          value: 'Best Regards, John',
          uid: '5678'
        }
      ]
    };

    const values1: Record<string, string> = {
      name1: 'Alice',
      name2: 'a',
      name3: 'a'
    };
    const result1 = getStringFromTemplate(template, values1);
    expect(result1).toEqual(
      'Hello, Alice! How are you today? This is the true branch 1. Nested true branch. This is the true branch 2. Best Regards, John'
    );

    const values2: Record<string, string> = {
      name1: 'Bob',
      name2: 'a',
      name3: ''
    };
    const result2 = getStringFromTemplate(template, values2);
    expect(result2).toEqual(
      'Hello, Bob! How are you today? This is the true branch 1. Nested false branch. This is the true branch 2. Best Regards, John'
    );

    const values3: Record<string, string> = {
      name1: 'Charlie',
      name2: '',
      name3: ''
    };
    const result3 = getStringFromTemplate(template, values3);
    expect(result3).toEqual(
      'Hello, Charlie! How are you today? This is the false branch. Best Regards, John'
    );
  });

  it('should replace variables with values only if they are inclosed in curly braces', () => {
    const templateLeftBrace: Input = {
      type: 'normal',
      value: 'Hello, {name1! How are you?',
      uid: '9999'
    };

    const values: Record<string, string> = {
      name1: 'Tim'
    };

    const resultLeft = getStringFromTemplate(templateLeftBrace, values);
    expect(resultLeft).toEqual('Hello, {name1! How are you?');

    const templateRightBrace: Input = {
      type: 'normal',
      value: 'Hello, name1}! How are you?',
      uid: '9999'
    };

    const resultRight = getStringFromTemplate(templateRightBrace, values);
    expect(resultRight).toEqual('Hello, name1}! How are you?');

    const templateNoBraces: Input = {
      type: 'normal',
      value: 'Hello, name1! How are you?',
      uid: '9999'
    };

    const resultNo = getStringFromTemplate(templateNoBraces, values);
    expect(resultNo).toEqual('Hello, name1! How are you?');
  });

  it('should work with multiple variables in if-then-else', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello {name1}! How is your {name2}? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{name3}{name4}',
          uid: '5678-1',
          children: [
            {
              type: 'then',
              value: 'This is the true branch. ',
              uid: '5678-1-1'
            },
            {
              type: 'else',
              value: 'This is the false branch. ',
              uid: '5678-1-2'
            }
          ]
        },
        {
          type: 'normal',
          value: 'Best Regards, John',
          uid: '1234'
        }
      ]
    };

    const valuesTrueFirst: Record<string, string> = {
      name1: 'Tom',
      name2: 'day',
      name3: 'a',
      name4: 'a'
    };
    const resultTrueFirst = getStringFromTemplate(template, valuesTrueFirst);
    expect(resultTrueFirst).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const valuesTrueSecond: Record<string, string> = {
      name1: 'Tom',
      name2: 'day',
      name3: 'a',
      name4: ''
    };
    const resultTrueSecond = getStringFromTemplate(template, valuesTrueSecond);
    expect(resultTrueSecond).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const valuesTrueThird: Record<string, string> = {
      name1: 'Tom',
      name2: 'day',
      name3: '',
      name4: 'a'
    };
    const resultTrueThird = getStringFromTemplate(template, valuesTrueThird);
    expect(resultTrueThird).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const valuesFalse: Record<string, string> = {
      name1: 'Tom',
      name2: 'day',
      name3: '',
      name4: ''
    };
    const resultFalse = getStringFromTemplate(template, valuesFalse);
    expect(resultFalse).toEqual(
      'Hello Tom! How is your day? This is the false branch. Best Regards, John'
    );
  });

  it("should ignore variables that don't exist", () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello {name}! How is your {timeOfDay}? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{var1}',
          uid: '5678-1',
          children: [
            {
              type: 'then',
              value: 'This is the true branch. ',
              uid: '5678-1-1'
            },
            {
              type: 'else',
              value: 'This is the false branch. ',
              uid: '5678-1-2'
            }
          ]
        },
        {
          type: 'normal',
          value: 'Best Regards, John',
          uid: '1234'
        }
      ]
    };

    const values: Record<string, string> = {
      name: 'John',
      timeOfDay: 'day',
      var1: ''
    };

    const result = getStringFromTemplate(template, values);
    expect(result).toEqual(
      'Hello {name}! How is your {timeOfDay}? This is the true branch. Best Regards, John'
    );
  });

  it('should replace missing variables with empty strings', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello {name1}! How is your {name2}? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{name3}',
          uid: '5678-1',
          children: [
            {
              type: 'then',
              value: 'This is the true branch. ',
              uid: '5678-1-1'
            },
            {
              type: 'else',
              value: 'This is the false branch. ',
              uid: '5678-1-2'
            }
          ]
        },
        {
          type: 'normal',
          value: 'Best Regards, John',
          uid: '1234'
        }
      ]
    };

    const values: Record<string, string> = {
      name: 'John',
      timeOfDay: 'day',
      var1: ''
    };

    const result = getStringFromTemplate(template, values);
    expect(result).toEqual(
      'Hello ! How is your ? This is the false branch. Best Regards, John'
    );
  });

  it('should ignore if variable is replaced with name of another variable', () => {
    const template: Input = {
      type: 'normal',
      value: '{name1}, {name2}!',
      uid: '1234'
    };

    const valuesFirst: Record<string, string> = {
      name1: '{name1}',
      name2: 'world'
    };

    const resultFirst = getStringFromTemplate(template, valuesFirst);
    expect(resultFirst).toEqual('{name1}, world!');

    const valuesSecond: Record<string, string> = {
      name1: 'Hello',
      name2: '{name1}'
    };
    const resultSecond = getStringFromTemplate(template, valuesSecond);
    expect(resultSecond).toEqual('Hello, {name1}!');
  });
});
