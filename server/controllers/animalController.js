const Animal = require('../models/animal');

const addAnimalData = async (req, res) => {
    const userId = req.user.id;
    const {
        farmId,
        tagNumber,
        name,
        animalType,
        motherId,
        fatherId,
        otherAnimalType,
        breed,
        gender,
        weight,
        dateOfBirth,
        acquisitionDate
    } = req.body;

    let generation = 1;
    let finalAnimalType = animalType === 'other' ? otherAnimalType : animalType;

    try {
        // Check if animal tag already exists
        const existingAnimal = await Animal.findOne({ tagNumber });
        if (existingAnimal) {
            return res.status(409).json({ message: "Animal Id already exists" });
        }

        let motherRef, fatherRef;

        // ✅ Find mother ObjectId using her tag number
        if (motherId && motherId.trim() !== "") {
            const mother = await Animal.findOne({ tagNumber: motherId });
            if (!mother && mother.gender != 'Female') {
                return res.status(404).json({ message: "Mother with given tag not found in that breed" });
            }
            motherRef = mother._id;
            generation = mother.generation + 1; // increment generation
        }

        // ✅ Find father ObjectId using his tag number
        if (fatherId && fatherId.trim() !== "") {
            const father = await Animal.findOne({ tagNumber: fatherId });
            if (!father && father.gender != 'Male') {
                return res.status(404).json({ message: "Father with given tag not found in that breed" });
            }
            fatherRef = father._id;
        }

        // ✅ Create new animal with ObjectId references
        const animal = new Animal({
            tagNumber,
            name,
            farmId,
            animalType: finalAnimalType,
            breed,
            gender,
            motherId: motherRef,
            fatherId: fatherRef,
            generation,
            weight,
            dateOfBirth,
            acquisitionDate
        });

        await animal.save();

        return res.status(201).json({ message: "Animal added successfully" });

    } catch (err) {
        console.error("Registration error: ", err);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

module.exports = {
    addAnimalData,
};
