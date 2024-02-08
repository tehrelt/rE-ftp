use std::{io::Cursor, sync::Mutex};

use ftp::{FtpError, FtpStream};

extern crate ftp;

pub static FTP: Mutex<Option<FtpStream>> = Mutex::new(None);

pub fn connect(host: &str, user: &str, password: &str, port: i32) -> Result<(), FtpError> {

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");

    if ftp_mutex.is_some() {
        let _ = check_connection().expect_err("Connection alive");
    }

    let mut ftp = FtpStream::connect(format!("{}:{}", host, port))?;
    
    let _ = ftp.login(user, password)?;
    
    *ftp_mutex = Some(ftp);
    drop(ftp_mutex);

    Ok(())
}
pub fn disconnect() -> Result<(), FtpError> {
    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let _ = ftp.quit().expect("Unexpected error while executing disconnect");

    *ftp_mutex = None;

    drop(ftp_mutex);

    Ok(())
}

pub fn check_connection() -> Result<(), FtpError> {

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut();

    if ftp.is_none() {
        return Err(FtpError::InvalidResponse(format!("FTP stream not initialized")))
    }

    // Attempt to send a NOOP command to the FTP server
    ftp.unwrap().noop()?;
    println!("Connection alive to the FTP server");

    drop(ftp_mutex);
    
    Ok(())
}

pub fn ls() -> Result<Vec<String>, FtpError> {
   
    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let list = ftp.list(None);
    if list.is_err() {
        drop(ftp_mutex);
        return list;
    }

    drop(ftp_mutex);
    
    Ok(list.unwrap())
}
pub fn pwd() -> Result<String, FtpError> {

    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let path = ftp.pwd().expect("Unexpected error while executing pwd");

    drop(ftp_mutex);

    return Ok(path);
}
pub fn cwd(file_name: &str) -> Result<(), FtpError> {
    
    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let cwd_r = ftp.cwd(file_name);

    if cwd_r.is_err() {
        drop(ftp_mutex);
        return cwd_r;
    }

    drop(ftp_mutex);

    Ok(())
}
pub fn mkdir(file_name: &str) -> Result<(), FtpError> {
    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let _ = ftp.mkdir(file_name);

    drop(ftp_mutex);

    Ok(())
}
pub fn get(file_name: &str) -> Result<Vec<u8>, FtpError> {
    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let bytes = ftp.simple_retr(file_name).unwrap().into_inner();

    drop(ftp_mutex);

    Ok(bytes)
}
pub fn put(file_name: &str, bytes: Vec<u8>) -> Result<(), FtpError>{

    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let mut reader = Cursor::new(bytes);
    let _ = ftp.put(file_name, &mut reader);

    drop(ftp_mutex);

    Ok(())
}