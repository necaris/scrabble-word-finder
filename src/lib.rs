extern crate actix_files;
extern crate actix_http;
extern crate actix_rt;
extern crate actix_web;
extern crate failure;
extern crate serde;
#[macro_use]
extern crate lazy_static;

use failure::Fail;
use std::io;

pub mod solver;
pub mod util;
pub mod web;

#[derive(Fail, Debug)]
pub enum Error {
    #[fail(display = "internal error")]
    InternalError,
    #[fail(display = "bad request")]
    BadClientData,
    #[fail(display = "could not initialize")]
    Startup,
}

impl From<Error> for io::Error {
    fn from(error: Error) -> Self {
        Self::new(io::ErrorKind::Other, error.to_string())
    }
}

impl From<io::Error> for Error {
    fn from(_error: io::Error) -> Self {
        Self::Startup
    }
}

#[derive(Debug, Clone)]
pub struct DictionaryEntry(String, String);
