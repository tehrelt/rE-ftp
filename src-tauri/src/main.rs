
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ftp;

mod rustysocket;
mod mftp;

use mftp::FTP;
use rustysocket::{create_log_message, send_log_message};
use tauri::{api::file, Window};
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
            rustysocket::send_log_message(&window, &create_log_message(&format!("Refreshed items for: {}", path)));
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

#[tauri::command]
fn cwd(window: Window, file_name: &str) {
    let _ = mftp::cwd(file_name);
    send_log_message(&window, &create_log_message(&format!("Moved to '{}'", file_name)));
}

#[tauri::command]
fn mkdir(window: Window, dir_name: &str) {
    let _ = mftp::mkdir(dir_name);
    send_log_message(&window, &create_log_message(&format!("Created dir to '{}'", dir_name)));
}

#[tauri::command]
fn get(window: Window, file_name: &str) -> Option<Vec<u8>>{
    let bytes = mftp::get(file_name);

    match bytes {
        Some(x) => {
            send_log_message(&window, &create_log_message(&format!("File '{}' starts downloading", file_name)));
            return Some(x);
        },
        None => { 
            send_log_message(&window, &create_log_message(&format!("Something went wrong with downloading '{}'", file_name))); 
            return None;
        }
    }    
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping, connect, disconnect, list, pwd, cwd, mkdir, get])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
