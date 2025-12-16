import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: "fullName",
      type: "text",
    },
    {
      name: 'roles',
      type: "radio",
      options: [
        {
          label: 'Driver',
          value: 'driver',
        },
        {
          label: 'Monitor',
          value: 'monitor',
        },
      ],
      defaultValue: 'driver',
      required: true,
    }
  ],
}
