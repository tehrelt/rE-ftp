
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ftp;

mod rustysocket;

use tauri::{window, Window};
use std::str;
use ftp::FtpStream;

#[tauri::command]
fn connect(
    window: Window,
    host: &str, 
    user: &str, 
    pass: &str, 
    port: i32) {

    rustysocket::send_log_message(&window, &rustysocket::create_log_message(&format!("connecting to {}:{}", host, port)));
    let mut ftp_stream = FtpStream::connect(format!("{}:{}", host, port)).unwrap();
    rustysocket::send_log_message(&window, &rustysocket::create_log_message(&format!("connected to {}:{}", host, port)));


    let _ = ftp_stream.login(user, pass).unwrap();
    rustysocket::send_log_message(&window, &rustysocket::create_log_message(&format!("logged in as {}", user)));

    

    let pwd = ftp_stream.pwd().unwrap();

    // Get the current directory that the client will be reading from and writing to.
    let msg = format!("Current directory: {}", pwd);
    println!("{}", msg);

    rustysocket::send_log_message(&window, &rustysocket::create_log_message(&msg));

    let list = ftp_stream.list(None).unwrap();

    for item in list {
        println!("{}", item);
    }

    // let _ = ftp_stream.cwd("new").unwrap();
    // let pwd = ftp_stream.pwd().unwrap();
    // println!("Current directory: {}", pwd);
    // let list = ftp_stream.list(None).unwrap();
    // for item in list {
    //     println!("{}", item);
    // }
    // // Change into a new directory, relative to the one we are currently in.
    // let _ = ftp_stream.cwd("test_data").unwrap();

    // Retrieve (GET) a file from the FTP server in the current working directory.
    // let remote_file = ftp_stream.simple_retr("test.txt").unwrap();
    // println!("Read file with contents\n{}\n", str::from_utf8(&remote_file.into_inner()).unwrap());

    // // Store (PUT) a file from the client to the current working directory of the server.
    // let mut reader = Cursor::new("Hello from the Rust \"ftp\" crate!".as_bytes());
    // let _ = ftp_stream.put("greeting.txt", &mut reader);
    // println!("Successfully wrote greeting.txt");

    // Terminate the connection to the server.
    let _ = ftp_stream.quit();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
