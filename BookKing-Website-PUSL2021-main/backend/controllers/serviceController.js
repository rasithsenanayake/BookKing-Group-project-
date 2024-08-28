import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { conn } from '../config/dbCon.js'

const { JWTSECRET } = process.env

const db = conn

const addService = (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token, JWTSECRET)

    const sql = 'INSERT INTO service (Name, LongDescription, ShortDescription, Price, Location, category, Image, Image2, Image3, Image4, Image5, SPID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    const data = [
      req.body.name,
      req.body.longDescription,
      req.body.shortDescription,
      req.body.price,
      req.body.location,
      req.body.category,
      req.files?.image?.[0].filename,
      req.files?.image2?.[0].filename,
      req.files?.image3?.[0].filename,
      req.files?.image4?.[0].filename,
      req.files?.image5?.[0].filename,
      decode.SPID
    ]

    db.query(sql, data, (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      const SID = result.SID
      return res.status(200).json({ msg: 'Service added successfully', SID })
    })

    db.query(
      'UPDATE service SET isAvailable = 1'
    )
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const updateService = (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token, JWTSECRET)

    const {
      SID,
      Name,
      Location,
      Price,
      isAvailable,
      ShortDescription,
      LongDescription
    } = req.body

    const sql =
      'UPDATE service SET Name = ?, LongDescription = ?, ShortDescription = ?, Price = ?, isAvailable = ?, Location = ? WHERE SID = ? AND SPID = ?'
    const data = [
      Name,
      LongDescription,
      ShortDescription,
      Price,
      isAvailable,
      Location,
      SID,
      decode.SPID
    ]

    db.query(`UPDATE service SET updatedAt = now() WHERE SID = '${SID}'`)
    db.query(sql, data, (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Service not found' })
      }
      return res.status(200).json({ msg: 'Service updated successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const deleteService = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token, JWTSECRET)

    const sql = 'DELETE FROM service WHERE SID = ? AND SPID = ?'
    const data = [req.body.SID, decode.SPID]

    db.query(sql, data, (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Service not found' })
      }

      return res.status(200).json({ msg: 'Service deleted successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getHotels = (req, res) => {
  try {
    db.query('SELECT * FROM service WHERE category = "Hotel"', (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: 'No hotels found' })
      }

      return res.status(200).json({ success: true, data: result, message: 'Hotels fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getTours = (req, res) => {
  try {
    db.query('SELECT * FROM service WHERE category = "Tour"', (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: 'No tours found' })
      }

      return res.status(200).json({ success: true, data: result, message: 'Tours fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getVehicles = (req, res) => {
  try {
    db.query('SELECT * FROM service WHERE category = "Vehicle"', (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: 'No vehicles found' })
      }

      return res.status(200).json({ success: true, data: result, message: 'Vehicles fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getServices = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token, JWTSECRET)

    const sql = 'SELECT * FROM service WHERE SPID = ?'
    const data = [decode.SPID]

    db.query(sql, data, (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: 'No services found' })
      }

      return res.status(200).json({ success: true, data: result, message: 'Services fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getSingleService = (req, res) => {
  try {
    db.query(`SELECT * FROM service WHERE SID = "${req.body.SID}"`, (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: 'No service found' })
      }

      return res.status(200).json({ success: true, data: result, message: 'Service fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getAllServices = (req, res) => {
  try {
    db.query('SELECT * FROM service', (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }
      return res.status(200).json({ success: true, data: result, message: 'Services fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

const getSpService = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token, JWTSECRET)
    const SID = req.params.SID

    const sql = 'SELECT * FROM service WHERE SID = ? AND SPID = ?'
    const data = [SID, decode.SPID]

    db.query(sql, data, (error, result) => {
      if (error) {
        return res.status(400).json({ msg: error.message })
      }
      if (result.length === 0) {
        return res.status(404).json({ msg: 'Service not found' })
      }
      return res.status(200).json({ success: true, data: result[0], message: 'Service fetched successfully' })
    })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
}

export { addService, updateService, deleteService, getHotels, getTours, getVehicles, getServices, getSingleService, getAllServices, getSpService }
