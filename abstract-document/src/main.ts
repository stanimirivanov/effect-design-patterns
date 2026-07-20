import { Effect } from 'effect';
import { program } from './program';

// Execute the program only when this module is the application entry point.
// Importing the module from tests exposes the Effect without executing it.
if (import.meta.main) {
  Effect.runPromise(program);
}
