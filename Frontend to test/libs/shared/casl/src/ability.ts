import { AbilityBuilder, createMongoAbility, MongoAbility, ExtractSubjectType } from '@casl/ability';

// 1. Define your App's Actions and Subjects for TypeScript autocomplete
export type Actions = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'MANAGE';
export type Subjects = 'PATIENT' | 'APPOINTMENT' | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects | any]>;

// 2. The interface for your backend's JSON response
export interface PermissionPayload {
  permissions: {
    [subject: string]: {
      [action: string]: {
        conditions?: Record<string, any>;
      };
    };
  };
}

// 3. The Builder Function
export function buildUserAbility(payload: PermissionPayload): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const perms = payload?.permissions || {};

  // Loop through the custom JSON structure and map it to CASL rules
  for (const [subjectName, actions] of Object.entries(perms)) {
    for (const [actionName, config] of Object.entries(actions)) {
      // If conditions exist, pass them; otherwise, grant general access to the action/subject
      const conditions = config.conditions && Object.keys(config.conditions).length > 0 
        ? config.conditions 
        : undefined;
      
      can(actionName as Actions, subjectName as ExtractSubjectType<Subjects>, conditions);
    }
  }

  return build({
    // Optional but recommended: helps CASL identify the subject type of raw objects
    detectSubjectType: (item) => {
      if (item && typeof item === 'object' && item.__type) {
        return item.__type;
      }
      return 'all';
    }
  });
}