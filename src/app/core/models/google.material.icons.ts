export const GoogleIcons = {
  Edit: "edit_document",
  Person: "person",
  Task: "task",
  MoreVert: "more_vert",
  MoreHoriz: "more_horiz",
  Delete: "delete",
  PlayArrow: "play_arrow",
  Pause: "pause",
  ListAltCheck: "list_alt_check",
  Abc: "abc"
} as const;

export type MaterialIcons = typeof GoogleIcons[keyof typeof GoogleIcons];
