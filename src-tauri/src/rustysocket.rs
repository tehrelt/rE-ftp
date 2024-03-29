use chrono::prelude::*;

use tauri::Window;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct LogMessage {
    datetime: DateTime<Local>,
    message: String
}

impl LogMessage {
    pub fn new(message: String, datetime: DateTime<Local>) -> Self {
        Self { message, datetime }
    }
}

pub fn create_log_message(msg: &str) -> LogMessage {
    LogMessage::new(msg.to_string(), Local::now())
}
fn send_log_message(window: &Window, log: &LogMessage) {
    window.emit("log-socket-message", log).unwrap()
}

pub fn new_log_message(window: &Window, msg: String) {
    send_log_message(window, &create_log_message(&msg))
}

pub fn send_progress_message(window: &Window, progress: i32) {
    window.emit("progress-socket-message", progress).unwrap()
}