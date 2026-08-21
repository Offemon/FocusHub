export const GoogleIcons = {
  Edit: "edit_document",
  Person: "person",
  Task: "task",
  MoreVert: "more_vert",
  MoreHoriz: "more_horiz",
  Delete: "delete",
  Close: "close",
  CloseSmall: "close_small",
  PlayArrow: "play_arrow",
  Pause: "pause",
  ListAltCheck: "list_alt_check",
  Abc: "abc",
  CheckCircle: "check_circle",
  Error: "cancel",
  Info: "info",
  Warning: "warning"
} as const;

export type MaterialIcons = typeof GoogleIcons[keyof typeof GoogleIcons];
