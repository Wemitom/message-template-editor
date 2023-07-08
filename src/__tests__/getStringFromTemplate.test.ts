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
      var1: 'var'
    };
    const resultTrue = getStringFromTemplate(template, valuesTrue);
    expect(resultTrue).toEqual(
      'Hello Tom! How is your day? This is the true branch. Best Regards, John'
    );

    const values2: Record<string, string> = {
      name: 'Alice',
      timeOfDay: 'evening'
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
      var1: 'a'
    };
    const result2 = getStringFromTemplate(template, values2);
    expect(result2).toEqual(
      'Hello, Bob! How are you today? This is the true branch 1. Nested false branch. This is the true branch 2. Best Regards, John'
    );

    const values3: Record<string, string> = {
      name: 'Charlie'
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
});
