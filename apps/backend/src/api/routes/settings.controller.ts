import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { StarsService } from '@gitroom/nestjs-libraries/database/prisma/stars/stars.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import {AddTeamMemberDto} from "@gitroom/nestjs-libraries/dtos/settings/add.team.member.dto";
import {ApiTags} from "@nestjs/swagger";

@ApiTags('Settings')
@Controller('/settings')
export class SettingsController {
  constructor(
    private _starsService: StarsService,
    private _organizationService: OrganizationService
  ) {}

  @Get('/github')
  async getConnectedGithubAccounts() {
    return {
      github: (
        await this._starsService.getGitHubRepositoriesByOrgId()
      ).map((repo) => ({
        id: repo.id,
        login: repo.login,
      })),
    };
  }

  @Post('/github')
  async addGitHub(
    @Body('code') code: string
  ) {
    if (!code) {
      throw new Error('No code provided');
    }
    await this._starsService.addGitHub(code);
  }

  @Get('/github/url')
  authUrl() {
    return {
      url: `https://github.com/login/oauth/authorize?client_id=${
        process.env.GITHUB_CLIENT_ID
      }&scope=${encodeURIComponent(
        'user:email'
      )}&redirect_uri=${encodeURIComponent(
        `${process.env.FRONTEND_URL}/settings`
      )}`,
    };
  }

  @Get('/organizations/:id')
  async getOrganizations(
    @Param('id') id: string
  ) {
    return {
      organizations: await this._starsService.getOrganizations(id),
    };
  }

  @Get('/organizations/:id/:github')
  async getRepositories(
    @Param('id') id: string,
    @Param('github') github: string
  ) {
    return {
      repositories: await this._starsService.getRepositoriesOfOrganization(
        id,
        github
      ),
    };
  }

  @Post('/organizations/:id')
  async updateGitHubLogin(
    @Param('id') id: string,
    @Body('login') login: string
  ) {
    return this._starsService.updateGitHubLogin(id, login);
  }

  @Delete('/repository/:id')
  async deleteRepository(
    @Param('id') id: string
  ) {
    return this._starsService.deleteRepository(id);
  }

  @Get('/team')
  async getTeam() {
    return this._organizationService.getTeam();
  }

  @Post('/team')
  async inviteTeamMember(
      @Body() body: AddTeamMemberDto,
  ) {
    return this._organizationService.inviteTeamMember(body);
  }

  @Delete('/team/:id')
  deleteTeamMember(
      @Param('id') id: string
  ) {
    return this._organizationService.deleteTeamMember(id);
  }
}
