// Usage: https://github.com/caroso1222/notyf
import { Notyf } from "notyf";

window.notyf = new Notyf({
  duration: 4000,
  dismissible: 'true',
  ripple: true,
  position: {
    x: "center",
    y: "top"
  },
  types: [
    {
      type: "default",
      backgroundColor: "#3B7DDD",
      icon: {
        className: "notyf__icon--success",
        tagName: "i",
      }
    },
    {
      type: "success",
      backgroundColor: "#28a745",
      icon: {
        className: "notyf__icon--success",
        tagName: "i",
      }
    },
    {
      type: "warning",
      backgroundColor: "#ffc107",
      icon: {
        className: "notyf__icon--error",
        tagName: "i",
      }
    },
    {
      type: "danger",
      backgroundColor: "#dc3545",
      icon: {
        className: "notyf__icon--error",
        tagName: "i",
      }
    }
  ]
});