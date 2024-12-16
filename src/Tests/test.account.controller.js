const mockingoose = require('mockingoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { getLoginPage, postLoginPage, getLogout, getPasswdResetPage, postPasswdResetPage, getPasswdChangePage, postPasswdChangePage, getProfilePage } = require('../path_to_your_controller');
const Pracownik = require('../models/Pracownik');

jest.mock('passport');
jest.mock('bcryptjs');

describe('Account Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLoginPage', () => {
    it('should render login page', async () => {
      const req = {};
      const res = {
        render: jest.fn(),
      };

      await getLoginPage(req, res);
      expect(res.render).toHaveBeenCalledWith('account/login', {});
    });
  });

  describe('postLoginPage', () => {
    it('should authenticate with passport and redirect', async () => {
      const req = {};
      const res = {
        redirect: jest.fn(),
      };
      const next = jest.fn();

      // Mock passport.authenticate to simulate successful login
      passport.authenticate = jest.fn().mockImplementation((strategy, options) => (req, res, next) => {
        res.redirect(options.successRedirect);
      });

      await postLoginPage(req, res, next);
      expect(passport.authenticate).toHaveBeenCalledWith('local', expect.anything());
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getLogout', () => {
    it('should logout and redirect', async () => {
      const req = {
        logout: jest.fn((cb) => cb(null)),
        flash: jest.fn(),
      };
      const res = {
        redirect: jest.fn(),
      };

      await getLogout(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith('success_msg', 'Wylogowano');
      expect(res.redirect).toHaveBeenCalledWith('/account/login');
    });

    it('should handle logout error', async () => {
      const req = {
        logout: jest.fn((cb) => cb(new Error('Logout Error'))),
        flash: jest.fn(),
      };
      const res = {
        redirect: jest.fn(),
      };

      await getLogout(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith('error', 'Błąd podczas wylogowywania');
      expect(res.redirect).toHaveBeenCalledWith('/account/login');
    });
  });

  describe('getPasswdResetPage', () => {
    it('should render password reset page if passwordToReset is true', async () => {
      const req = { user: { passwordToReset: true } };
      const res = {
        render: jest.fn(),
      };

      await getPasswdResetPage(req, res);
      expect(res.render).toHaveBeenCalledWith('account/passReset', { user: req.user });
    });

    it('should redirect if passwordToReset is false', async () => {
      const req = { user: { passwordToReset: false } };
      const res = {
        redirect: jest.fn(),
      };

      await getPasswdResetPage(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('postPasswdResetPage', () => {
    it('should process password reset and redirect', async () => {
      const req = {};
      const res = {
        flash: jest.fn(),
        redirect: jest.fn(),
      };

      await postPasswdResetPage(req, res);
      expect(req.flash).toHaveBeenCalledWith('success_msg', 'Prawidłowo zresetowano hasło');
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getPasswdChangePage', () => {
    it('should render password change page', async () => {
      const req = { user: {} };
      const res = {
        render: jest.fn(),
      };

      await getPasswdChangePage(req, res);
      expect(res.render).toHaveBeenCalledWith('account/passChange', { user: req.user });
    });
  });

  describe('postPasswdChangePage', () => {
    it('should handle validation errors', async () => {
      const req = {
        body: { oldPassword: '', newPassword: '', newPasswordRepeat: '' },
        user: {},
      };
      const res = {
        render: jest.fn(),
      };

      await postPasswdChangePage(req, res);

      expect(res.render).toHaveBeenCalledWith('account/passChange', expect.objectContaining({
        errors: expect.any(Array),
      }));
    });

    it('should change password if all fields are valid', async () => {
      const req = {
        body: {
          oldPassword: 'oldPass',
          newPassword: 'newPass123',
          newPasswordRepeat: 'newPass123',
        },
        user: { login: 'testUser' },
      };
      const res = {
        redirect: jest.fn(),
        flash: jest.fn(),
      };

      const mockPracownik = {
        save: jest.fn().mockResolvedValue(true),
      };

      mockingoose(Pracownik).toReturn(mockPracownik, 'findOne');

      bcrypt.genSalt = jest.fn().mockResolvedValue('salt');
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      await postPasswdChangePage(req, res);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockPracownik.save).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith('success_msg', 'Prawidłowo zmieniono hasło!');
      expect(res.redirect).toHaveBeenCalledWith('/account/profile');
    });

    it('should handle errors during password change', async () => {
      const req = {
        body: {
          oldPassword: 'oldPass',
          newPassword: 'newPass123',
          newPasswordRepeat: 'newPass123',
        },
        user: { login: 'testUser' },
      };
      const res = {
        render: jest.fn(),
        flash: jest.fn(),
      };

      const mockPracownik = {
        save: jest.fn().mockRejectedValue(new Error('Error')),
      };

      mockingoose(Pracownik).toReturn(mockPracownik, 'findOne');

      await postPasswdChangePage(req, res);

      expect(res.render).toHaveBeenCalledWith('account/passChange', expect.anything());
      expect(req.flash).toHaveBeenCalledWith('error', 'Wystąpił wewnętrzny błąd serwera!');
    });
  });

  describe('getProfilePage', () => {
    it('should render profile page', async () => {
      const req = { user: {} };
      const res = {
        render: jest.fn(),
      };

      await getProfilePage(req, res);
      expect(res.render).toHaveBeenCalledWith('account/profile', { user: req.user });
    });
  });
});
