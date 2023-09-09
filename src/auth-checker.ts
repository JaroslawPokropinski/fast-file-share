import { AuthCheckerInterface, ResolverData } from 'type-graphql';
import { ContextType } from './context';

export class AuthChecker implements AuthCheckerInterface<ContextType> {
  constructor() {}

  check(
    { root, args, context, info }: ResolverData<ContextType>,
    roles: string[]
  ) {
    return true;
  }
}
