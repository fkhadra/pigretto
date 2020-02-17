/*
 * Copyright (c) 2020 Anton Bagdatyev (Tonix-Tuft)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

import TrapExecutor from "./TrapExecutor";
import { withFunctionTrapExecutor } from "./behaviours/withFunctionTrapExecutor";

export default withFunctionTrapExecutor(
  class CallTrapExecutor extends TrapExecutor {
    getTrapArgsArgumentsListIndex() {
      return 4;
    }

    execute(
      [target, property, receiver, propertyValue],
      before,
      around,
      after
    ) {
      if (typeof propertyValue === "function") {
        if (propertyValue.isBound()) {
          propertyValue = propertyValue.bind(propertyValue.bindContextThisArg);
        } else {
          propertyValue = propertyValue.bind(target);
        }
        const wrapperFn = (...args) => {
          const trapArgs = [target, property, receiver, propertyValue, args];
          return super.execute(trapArgs, before, around, after);
        };
        return wrapperFn;
      }
      return propertyValue;
    }

    executeBeforeAdvice(
      [target, property, receiver, , argumentsList],
      advice,
      rule
    ) {
      const context = {
        target,
        property,
        receiver,
        rule
      };
      advice.fn.apply(context, argumentsList);
    }

    executeAroundAdvice(
      [target, property, receiver, , argumentsList],
      advice,
      rule,
      proceed
    ) {
      const context = {
        target,
        property,
        receiver,
        rule
      };
      return advice.fn(proceed).apply(context, argumentsList);
    }

    executeAfterAdvice(
      [target, property, receiver, , argumentsList],
      advice,
      rule,
      returnValue
    ) {
      const context = {
        target,
        property,
        receiver,
        rule
      };
      advice.fn(...argumentsList).apply(context, [returnValue]);
    }

    performUnderlyingOperation([, , , originalFn, argumentsList]) {
      const returnValue = originalFn(...argumentsList);
      return returnValue;
    }

    executeProceedCallback(
      [target, property, receiver, , argumentsList],
      rule,
      returnValue,
      callback
    ) {
      const context = {
        target,
        property,
        receiver,
        rule,
        argumentsList
      };
      return callback.apply(context, [returnValue]);
    }
  }
);
