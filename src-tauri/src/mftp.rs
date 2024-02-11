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
pub fn get(file_name: &str, on_progress: impl Fn(i32)) -> Result<Vec<u8>, FtpError> {
    check_connection()?;

    let mut ftp_mutex = FTP.lock().expect("Failed to lock FTP mutex");
    let ftp = ftp_mutex.as_mut().expect("FTP stream not initialized");

    let path = ftp.pwd().unwrap();
    let size = ftp.size(&format!("{}/{}", path, file_name)).unwrap().unwrap();
    let bytes = ftp.retr(file_name, |stream| {
        let mut bytes: Vec<u8> = vec![];
        let mut buf = [0; 256];
        let mut downloaded = 0;

        while downloaded < size {
            let _ = stream.read_exact(&mut buf);
            bytes.extend(buf.iter());
            downloaded += 256;
            on_progress(((downloaded / size) * 100).try_into().unwrap())
        }

        Ok(bytes)
    })?;

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