use std::sync::Mutex;

use ftp::FtpStream;

use crate::rustysocket;
extern crate ftp;

pub static FTP: Mutex<Option<FtpStream>> = Mutex::new(None);

pub fn connect(host: &str, user: &str, pass: &str, port: i32) -> bool {
    let mut ftp = FTP.lock().unwrap();
    match &mut *ftp {
        Some(x) => { 
            drop(x);
            return false;
        },
        None => {
            *ftp = Some(FtpStream::connect(format!("{}:{}", host, port)).unwrap());
            ftp.as_mut().unwrap().login(user, pass).unwrap()
        }
    }
    drop(ftp);
    return true;
}

pub fn disconnect() {
    let mut ftp = FTP.lock().unwrap();
    match &mut *ftp {
        Some(x) => { 
            x.quit();
            *ftp = None
        },
        None => {
            
        }
    }
    drop(ftp);
}

pub fn is_connected() -> bool {
    let mut ftp = FTP.lock().unwrap();
    let connect_alive = ftp.is_some();
    drop(ftp);
    return connect_alive;
}