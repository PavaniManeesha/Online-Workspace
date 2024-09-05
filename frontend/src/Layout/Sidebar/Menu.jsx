export const MENUITEMS = [
  {
    menutitle: "General",
    menucontent: "Dashboards,Widgets",
    Items: [
      {
        title: "Analytics",
        icon: "sample-page",
        type: "sub",
        children: [
          {
            active: false,
            path: `${process.env.PUBLIC_URL}/analytics/home`,
            title: "Home",
            type: "link",
          },
          {
            active: false,
            path: `${process.env.PUBLIC_URL}/pages/dashboard`,
            title: "Dashboard",
            type: "link",
          },
        ],
      },
    ],
  },
  {
    menutitle: "Components",
    menucontent: "Tools,Materials",
    Items: [
      {
        title: "Pages",
        icon: "sample-page",
        type: "sub",
        active: false,
        children: [
          {
            active: false,
            path: `${process.env.PUBLIC_URL}/pages/workspace`,
            title: "Workspace",
            type: "link",
          },
          {
            active: false,
            path: `${process.env.PUBLIC_URL}/pages/white-board`,
            title: "White Board",
            type: "link",
          },
          {
            active: false,
            path: `${process.env.PUBLIC_URL}/pages/note-pad`,
            title: "Note Pad",
            type: "link",
          },
          {
            active: false,
            path: `${process.env.PUBLIC_URL}/pages/file-manager`,
            title: "File Manager",
            type: "link",
          },
        ],
      },
    ],
  },
];
