
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ftp;

mod rustysocket;
mod mutex;

use mutex::FTP;
use rustysocket::create_log_message;
use tauri::Window;
use std::str;

#[tauri::command]
fn connect(
    window: Window,
    host: &str, 
    user: &str, 
    pass: &str, 
    port: i32) {

    rustysocket::send_log_message(&window, &create_log_message(&format!("connecting to {}:{}", host, port)));
    let fl = mutex::connect(host, user, pass, port);
    rustysocket::send_log_message(
        &window, 
        &create_log_message(if fl { "connection successfully" } 
                            else { "connection failed" }));
}

#[tauri::command]
fn ping(window: Window) -> bool {
    let r = mutex::is_connected();
    // rustysocket::send_log_message(
    //     &window, 
    //     &create_log_message(&format!("ping: {}", r)));
    return r;
}

#[tauri::command]
fn disconnect(window: Window) {
    mutex::disconnect();
    rustysocket::send_log_message(
        &window, 
        &create_log_message("disconnected"));
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping, connect, disconnect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
