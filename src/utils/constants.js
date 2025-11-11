export const UserRolesEnum = {
  //Enum is a datatype
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
}; //here we are sending the whole object

export const AvailableUserRole = Object.values(UserRolesEnum); //here we are sending an array

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGESS: "in_progress",
  DONE: "done",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
