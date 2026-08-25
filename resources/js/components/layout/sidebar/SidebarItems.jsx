export const SidebarContent = [
  {
    heading: 'Main',
    children: [
      {
        name: "Dashboard",
        icon: "LayoutDashboard",
        url: "/dashboard",
        roles: ['ADMIN', 'STORE'],
      },
      {
        name: "Products",
        icon: "Package",
        url: "/dashboard/products",
        roles: ['ADMIN', 'STORE'],
      },
      {
        name: "Categories",
        icon: "Layers",
        url: "/dashboard/categories",
        roles: ['ADMIN'],
      },
      {
        name: "Orders",
        icon: "ShoppingCart",
        url: "/dashboard/orders",
        roles: ['ADMIN', 'STORE'],
      },
    ],
  },
  {
    heading: 'User Management',
    children: [
      {
        name: 'Stores',
        icon: 'Store',
        url: '/dashboard/stores',
        roles: ['ADMIN'],
      },

      {
        name: 'Clients',
        icon: 'Users',
        url: '/dashboard/clients',
        roles: ['ADMIN'],
      },

    ],
  },

 
];

export default SidebarContent;
