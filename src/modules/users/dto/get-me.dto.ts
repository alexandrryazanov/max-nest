export const getMeResponse = {
  status: 200,
  description: 'Get current user',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      age: { type: 'number' },
      isAdmin: { type: 'boolean' },
    },
  },
};
