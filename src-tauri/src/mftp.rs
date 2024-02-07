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

pub fn ls() -> Option<String> {
    if is_connected() == false { 
        return None; 
    }

    let mut ftp = FTP.lock().unwrap();

    let list = ftp.as_mut().unwrap().list(None).unwrap();

    let mut owned_string = "".to_owned();

    for item in list {
        println!("{}", item);
        owned_string.push_str(&format!("{};", item));
    }

    drop(ftp);
    return Some(owned_string);  
}

pub fn pwd() -> Option<String> {
    if is_connected() == false { 
        return None; 
    }

    let mut ftp = FTP.lock().unwrap();

    let path = ftp.as_mut().unwrap().pwd().unwrap();

    drop(ftp);
    return Some(path);
}

pub fn cwd(file_name: &str) {
    if is_connected() == false { 
        return; 
    }

    let mut ftp = FTP.lock().unwrap();

    let _ = ftp.as_mut().unwrap().cwd(file_name);

    drop(ftp);
}


pub fn is_connected() -> bool {
    let mut ftp = FTP.lock().unwrap();
    let connect_alive = ftp.is_some();
    drop(ftp);
    return connect_alive;
}

pub fn mkdir(file_name: &str) -> bool {
    if is_connected() == false { 
        return false; 
    }

    let mut ftp = FTP.lock().unwrap();

    let _ = ftp.as_mut().unwrap().mkdir(file_name);

    drop(ftp);
    return true;
}