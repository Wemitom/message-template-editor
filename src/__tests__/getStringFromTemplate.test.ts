import { Input } from '../components/Editor/types';
import { getStringFromTemplate } from '../utils/functions';

describe('getStringFromTemplate', () => {
  it('should generate the string from a simple text template', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello, {something}!',
      uid: '1234'
    };

    const values: Record<string, string> = {
      something: 'world'
    };

    const result = getStringFromTemplate(template, values);

    expect(result).toEqual('Hello, world!');
  });

  it('should generate the string from a template with if-then-else branches', () => {
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

    const valuesTrue: Record<string, string> = {
      name: 'Tom',
      timeOfDay: 'day',
      var1: 'var',
      var2: ''
    };
    const resultTrue = getStringFromTemplate(template, valuesTrue);
    expect(resultTrue).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const values2: Record<string, string> = {
      name: 'Alice',
      timeOfDay: 'evening',
      var1: '',
      var2: ''
    };
    const result2 = getStringFromTemplate(template, values2);
    expect(result2).toEqual(
      'Hello Alice! How is your evening? This is the false branch. Best Regards, John'
    );
  });

  it('should generate the string from a template with nested if-then-else branches', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello, {name}! How are you today? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{var1}',
          uid: '5678-1',
          children: [
            {
              type: 'then',
              value: 'This is the true branch 1. ',
              uid: '5678-1-1',
              children: [
                {
                  type: 'if',
                  value: '{var2}',
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
      name: 'Alice',
      var1: 'a',
      var2: 'a'
    };
    const result1 = getStringFromTemplate(template, values1);
    expect(result1).toEqual(
      'Hello, Alice! How are you today? This is the true branch 1. Nested true branch. This is the true branch 2. Best Regards, John'
    );

    const values2: Record<string, string> = {
      name: 'Bob',
      var1: 'a',
      var2: ''
    };
    const result2 = getStringFromTemplate(template, values2);
    expect(result2).toEqual(
      'Hello, Bob! How are you today? This is the true branch 1. Nested false branch. This is the true branch 2. Best Regards, John'
    );

    const values3: Record<string, string> = {
      name: 'Charlie',
      var1: '',
      var2: ''
    };
    const result3 = getStringFromTemplate(template, values3);
    expect(result3).toEqual(
      'Hello, Charlie! How are you today? This is the false branch. Best Regards, John'
    );
  });

  it('should replace variables with values only if they are inclosed in curly braces', () => {
    const templateLeftBrace: Input = {
      type: 'normal',
      value: 'Hello, {name! How are you?',
      uid: '9999'
    };

    const values: Record<string, string> = {
      name: 'Tim'
    };

    const resultLeft = getStringFromTemplate(templateLeftBrace, values);
    expect(resultLeft).toEqual('Hello, {name! How are you?');

    const templateRightBrace: Input = {
      type: 'normal',
      value: 'Hello, name}! How are you?',
      uid: '9999'
    };

    const resultRight = getStringFromTemplate(templateRightBrace, values);
    expect(resultRight).toEqual('Hello, name}! How are you?');

    const templateNoBraces: Input = {
      type: 'normal',
      value: 'Hello, name! How are you?',
      uid: '9999'
    };

    const resultNo = getStringFromTemplate(templateNoBraces, values);
    expect(resultNo).toEqual('Hello, name! How are you?');
  });

  it('should work with multiple variables in if-then-else', () => {
    const template: Input = {
      type: 'normal',
      value: 'Hello {name}! How is your {timeOfDay}? ',
      uid: '5678',
      children: [
        {
          type: 'if',
          value: '{var1}{var2}',
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
      name: 'Tom',
      timeOfDay: 'day',
      var1: 'a',
      var2: 'a'
    };
    const resultTrueFirst = getStringFromTemplate(template, valuesTrueFirst);
    expect(resultTrueFirst).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const valuesTrueSecond: Record<string, string> = {
      name: 'Tom',
      timeOfDay: 'day',
      var1: 'a',
      var2: ''
    };
    const resultTrueSecond = getStringFromTemplate(template, valuesTrueSecond);
    expect(resultTrueSecond).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const valuesTrueThird: Record<string, string> = {
      name: 'Tom',
      timeOfDay: 'day',
      var1: '',
      var2: 'a'
    };
    const resultTrueThird = getStringFromTemplate(template, valuesTrueThird);
    expect(resultTrueThird).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const valuesFalse: Record<string, string> = {
      name: 'Tom',
      timeOfDay: 'day',
      var1: '',
      var2: ''
    };
    const resultFalse = getStringFromTemplate(template, valuesFalse);
    expect(resultFalse).toEqual(
      'Hello Tom! How is your day? This is the false branch. Best Regards, John'
    );
  });

  it("shouldn`t replace variables that don't exist", () => {
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

    const values: Record<string, string> = {};

    const result = getStringFromTemplate(template, values);
    expect(result).toEqual(
      'Hello {name}! How is your {timeOfDay}? This is the false branch. Best Regards, John'
    );
  });
});
