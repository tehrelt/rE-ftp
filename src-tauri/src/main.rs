
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ftp;

mod rustysocket;
mod mftp;

use mftp::check_connection;
use rustysocket::{new_log_message, send_progress_message};
use tauri::Window;
use std::{fs, str};

#[tauri::command]
fn connect(window: Window, host: &str, user: &str, pass: &str, port: i32) -> Result<String, String> {
    println!("connect");
    rustysocket::new_log_message(&window, format!("connecting to {}:{}", host, port));
    let r = mftp::connect(host, user, pass, port);

    return match r {
        Ok(_)=>{
            new_log_message(&window, format!("successfully connected"));
            Ok(format!("successfully connected"))
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }, 
    }
}

#[tauri::command]
fn ping(window: Window) -> Result<String, String> {
    println!("ping");

    let result = check_connection();
    
    return match result {
        Ok(_) => {
            new_log_message(&window, format!("connected"));
            Ok(format!("connected"))
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    };
}

#[tauri::command]
fn disconnect(window: Window) -> Result<String, String> {
    println!("disconnect");

    let r = mftp::disconnect();

    return match r {
        Ok(_) => {
            new_log_message(&window, format!("successfully disconnected"));
            Ok(format!("successfully disconnected"))
        }
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn list(window: Window) -> Result<Vec<String>, String> {
    println!("list");

    let pwd_r = mftp::pwd();

    if pwd_r.is_err() {
        return Err(pwd_r.unwrap_err().to_string());
    }

    let content = mftp::ls();

    return match content {
        Ok(v) => {
            new_log_message(&window, format!("Refreshed items for: {}", pwd_r.unwrap()));
            Ok(v)
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn pwd(window: Window) -> Result<String, String> {
    println!("pwd");
    let r = mftp::pwd();

    return match r {
        Ok(v) => {
            new_log_message(&window, format!("pwd executed: {}", v));
            Ok(v)
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn cwd(window: Window, file_name: &str) -> Result<String, String> {
    println!("cwd");
    let r = mftp::cwd(file_name);

    return match r {
        Ok(_) => {
            new_log_message(&window, format!("successfully move to {}", file_name));
            Ok(format!("successfully move to {}", file_name))
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn mkdir(window: Window, dir_name: &str) -> Result<String, String> {
    println!("mkdir");
    let r = mftp::mkdir(dir_name);

    return match r {
        Ok(_) => {
            new_log_message(&window, format!("dir '{}' created successfully", dir_name));
            Ok(format!("dir '{}' created successfully", dir_name))
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn get(window: Window, file_name: &str) -> Result<Vec<u8>, String>{

    let r = mftp::get(file_name, |p: i32| {
        send_progress_message(&window, p)
    });

    return match r {
        Ok(v) => {
            new_log_message(&window, format!("File '{}' starts downloading", file_name));
            Ok(v)
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    };  
}


#[tauri::command]
fn put(window: Window, path: &str) -> Result<String, String>{
    println!("put");
    new_log_message(&window, format!("Uploading '{}'", path)); 

    let bytes = fs::read(path).unwrap();
    let (_, file_name) = path.rsplit_once('\\').unwrap();
    let r = mftp::put(file_name, bytes);
    
    return match r {
        Ok(_) => {
            new_log_message(&window, format!("file '{}' uploaded successfully", file_name));
            Ok(format!("dir '{}' created successfully", file_name))
        },
        Err(e) => {
            new_log_message(&window, e.to_string());
            Err(e.to_string())
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping, connect, disconnect, list, pwd, cwd, mkdir, get, put])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
