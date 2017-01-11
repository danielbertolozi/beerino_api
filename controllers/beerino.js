var randomstring = require("randomstring");

module.exports = function (app) {    

    app.get('/beerino/:beerinoId', function(req, res) {
        var connection = app.repository.connectionFactory();
        var beerinoRepository = new app.repository.beerinoRepository(connection);
        
        req.check('beerinoId', 'Identificador do Beerino Inválido').notEmpty().isLength(10);

        req.getValidationResult().then(function(errors) {
            if (errors.array().length) {
                return res.status(400).send(app.errorResponse(errors.array()));
            }

            beerinoRepository.get(req.params.beerinoId, function(error, result) {
                if (error) {
                    res.status(500).send(app.errorResponse(error));
                } else {
                    res.status(201).json(app.successResponse(result));
                }
            });
        });
    });

    app.post('/beerino', function (req, res) {
        var connection = app.repository.connectionFactory();
        var beerinoRepository = new app.repository.beerinoRepository(connection);
        var beerino = req.body;

        beerinoRepository.get(beerino.beerinoId, function(error, getResult) {
            if (error) {
                return res.status(500).send(app.errorResponse(error)); 
            }

            if (getResult.length) {
                var errors = [{msg: "Já existe um Beerino com essa identificação"}];
                return res.status(404).json(app.errorResponse(errors));
            }

            beerinoRepository.save(beerino, function (error, saveResult) {
                if (error) {
                    return res.status(500).send(app.errorResponse(error));
                }

                beerinoRepository.get(beerino.beerinoId, function(error, result) {
                    if (error) {
                        return res.status(500).send(app.errorResponse(error));
                    }

                    res.status(201).send(app.successResponse(result));
                });
            });
        });
    });

    app.post('/beerinos', function(req, res) {
        var connection = app.repository.connectionFactory();
        var userConnection = app.repository.connectionFactory();
        var beerinoRepository = new app.repository.beerinoRepository(connection);
        var userRepository = new app.repository.userRepository(connection);
        var options = req.body;
        var userNotFoundMessage = {mensagem: 'usuário não encontrado.'};

        userRepository.get(options.userEmail, function(error, userResult) {
            if (error) {
                return res.status(500).send(app.errorResponse(error));
            }

            if (!userResult.length) {
                return res.status(404).json(userNotFoundMessage);
            }

            beerinoRepository.list(userResult[0].userId, function(error, beerinoResult) {
                if (error) {
                    return res.status(500).send(app.errorResponse(error));
                }
                
                if (!beerinoResult.length) {
                    return res.status(404).json(userNotFoundMessage);
                }

                res.status(201).json(beerinoResult);
            });
        })
    });

    app.delete('/beerino/:beerinoId', function(req, res) {
        var connection = app.repository.connectionFactory();
        var beerinoRepository = new app.repository.beerinoRepository(connection);
        
        beerinoRepository.delete(req.params.beerinoId, function(error, result) {
            if (error) {
                res.status(500).send(app.errorResponse(error));
            } else {
                res.status(201).json(result);
            }
        });
    });

    app.get('/beerino/generate/identifier', function(req, res) { 
        var connection = app.repository.connectionFactory();
        var beerinoRepository = new app.repository.beerinoRepository(connection);
        var identifier = randomstring.generate(10);

        beerinoRepository.get(identifier, function(error, result) {
            if (error) {
                res.send(null);
            } else {
                if (!!result.length) {
                    var duplicatedIdentifier = identifier;
                    while(identifier == duplicatedIdentifier) {
                        identifier = randomstring.generate(10);
                    }
                }

                res.send(identifier);
            }
        });
    });
};
