
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ftp;

use std::fmt::format;
use std::str;
use std::io::Cursor;
use ftp::FtpStream;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn connect(
    host: &str, 
    user: &str, 
    pass: &str, 
    port: i32) {

    // let parts = connection_string.split(";");
    // let collection = parts.collect::<Vec<&str>>();

    // let host = collection[0];
    // let user = collection[1];
    // let pass = collection[2];
    // let port = collection[3];

    let mut ftp_stream = FtpStream::connect(format!("{}:{}", host, port)).unwrap();
    let _ = ftp_stream.login(user, pass).unwrap();

    let pwd = ftp_stream.pwd().unwrap();

    // Get the current directory that the client will be reading from and writing to.
    println!("Current directory: {}", pwd);
    let list = ftp_stream.list(None).unwrap();

    for item in list {
        println!("{}", item);
    }

    let _ = ftp_stream.cwd("new").unwrap();
    let pwd = ftp_stream.pwd().unwrap();
    println!("Current directory: {}", pwd);
    let list = ftp_stream.list(None).unwrap();
    for item in list {
        println!("{}", item);
    }
    // // Change into a new directory, relative to the one we are currently in.
    // let _ = ftp_stream.cwd("test_data").unwrap();

    // Retrieve (GET) a file from the FTP server in the current working directory.
    let remote_file = ftp_stream.simple_retr("test.txt").unwrap();
    println!("Read file with contents\n{}\n", str::from_utf8(&remote_file.into_inner()).unwrap());

    // // Store (PUT) a file from the client to the current working directory of the server.
    // let mut reader = Cursor::new("Hello from the Rust \"ftp\" crate!".as_bytes());
    // let _ = ftp_stream.put("greeting.txt", &mut reader);
    // println!("Successfully wrote greeting.txt");

    // Terminate the connection to the server.
    let _ = ftp_stream.quit();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
