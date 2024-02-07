
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ftp;

mod rustysocket;
mod mftp;

use mftp::FTP;
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
    let fl = mftp::connect(host, user, pass, port);
    rustysocket::send_log_message(
        &window, 
        &create_log_message(if fl { "connection successfully" } 
                            else { "connection failed" }));
}

#[tauri::command]
fn ping(window: Window) -> bool {
    let r = mftp::is_connected();
    // rustysocket::send_log_message(
    //     &window, 
    //     &create_log_message(&format!("ping: {}", r)));
    return r;
}

#[tauri::command]
fn disconnect(window: Window) {
    mftp::disconnect();
    rustysocket::send_log_message(
        &window, 
        &create_log_message("disconnected"));
}

#[tauri::command]
fn list(window: Window) -> String {
    let content = mftp::ls();
    let path = mftp::pwd().unwrap();
    match content {
        None => {
            rustysocket::send_log_message(&window, &create_log_message(&format!("nothing found at: {}", path)));
            return "".to_string();
        },
        Some(x) => {
            rustysocket::send_log_message(&window, &create_log_message(&format!("current directory: {}", path)));
            return x;
        }
    }
}

#[tauri::command]
fn pwd(window: Window) -> String {
    let pwd = mftp::pwd();
    match pwd {
        None => {
            return "".to_string();
        },
        Some(x) => {
            return x;
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping, connect, disconnect, list, pwd])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
